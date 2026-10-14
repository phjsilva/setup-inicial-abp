import { CarbonClient } from '../../integrations/carbon-api.js';
import type { RegionsResponse } from '../../integrations/carbon-api.schema.js';
import { MetricsClient } from '../../integrations/metrics-api.js';
import type { MetricsResponse, MetricsService } from '../../integrations/metrics-api.schema.js';
import { pool } from '../../db/connection.js';
import { ExternalApiError } from '../../shared/errors/external-api-error.js';
import { CollectionsRepository } from './collections.repository.js';
import { monitoringService } from '../monitoring/monitoring.service.js';
import type {
    ActiveService,
    Emissions,
    EstimateParameter,
    ProcessedMetrics,
    ServiceStatus,
} from './collections.types.js';

export class CollectionsService {
    constructor(
        private readonly repository: CollectionsRepository,
        private readonly carbon: CarbonClient,
        private readonly metrics: MetricsClient,
    ) {}

    async syncRegions(): Promise<void> {
        let response: RegionsResponse;
        try {
            response = await this.carbon.getRegions();
            monitoringService.recordDependency('carbon', 'available');
        } catch (err) {
            monitoringService.recordDependency('carbon', 'unavailable');
            if (
                err instanceof ExternalApiError &&
                err.kind === 'bad_status' &&
                err.status === 530
            ) {
                console.warn(
                    '[sync-regions] API de carbono inacessível (530). ' +
                        'Mantendo regiões já salvas.',
                );
                return;
            }

            if (err instanceof ExternalApiError) {
                console.warn(
                    `[sync-regions] falha na API de carbono (${err.kind}), ` +
                        'mantendo regiões já salvas',
                );
                return;
            }

            throw err;
        }

        for (const region of response.regions) {
            try {
                if (await this.repository.existsByCode(region.code)) {
                    await this.repository.updateRegion(region);
                } else {
                    await this.repository.createRegion(region);
                }
                monitoringService.recordDependency('database', 'available');
            } catch (err) {
                monitoringService.recordDependency('database', 'unavailable');
                console.error(`Falha ao sincronizar região ${region.code}:`, err);
            }
        }
    }

    async syncServices(): Promise<void> {
        let services: MetricsService[];

        try {
            services = await this.metrics.getServices();
            monitoringService.recordDependency('metricsDiscovery', 'available');
        } catch (err) {
            monitoringService.recordDependency('metricsDiscovery', 'unavailable');
            if (err instanceof ExternalApiError) {
                console.warn(
                    `[sync-services] falha na API de métricas ` +
                        `(${err.kind}, HTTP ${err.status ?? 'sem resposta'}), ` +
                        'mantendo serviços já salvos',
                );
                return;
            }

            throw err;
        }

        let hadFailures = false;

        for (const service of services) {
            try {
                const regionCode = service.location.region_code;

                const regionExists = await this.repository.existsByCode(regionCode);
                monitoringService.recordDependency('database', 'available');
                if (!regionExists) {
                    hadFailures = true;
                    monitoringService.recordRoundFailure();

                    console.error(
                        `[sync-services] Serviço ${service.id}: ` +
                            `região ${regionCode} ainda não cadastrada`,
                    );

                    continue;
                }

                const exists = await this.repository.existsServiceByExternalId(service.id);

                if (exists) {
                    await this.repository.updateDiscoveredService(service.id, regionCode);
                } else {
                    await this.repository.createService(service);
                }
                monitoringService.recordDependency('database', 'available');
            } catch (err) {
                hadFailures = true;
                monitoringService.recordDependency('database', 'unavailable');
                console.error(`[sync-services] Falha ao sincronizar ${service.id}:`, err);
            }
        }

        if (!hadFailures) {
            const discoveredIds = services.map((service) => service.id);

            try {
                const missingServices =
                    await this.repository.deactivateMissingServices(discoveredIds);
                monitoringService.recordDependency('database', 'available');

                for (const service of missingServices) {
                    try {
                        await this.repository.updateStatus(service.id, 'unavailable');
                        monitoringService.recordDependency('database', 'available');
                        console.warn(
                            `[sync-services] ${service.external_id} ausente da descoberta -> ` +
                                'ativo=false, status=unavailable',
                        );
                    } catch (err) {
                        monitoringService.recordDependency('database', 'unavailable');
                        console.error(
                            `[sync-services] Falha ao atualizar status de ${service.external_id}:`,
                            err,
                        );
                    }
                }
            } catch (err) {
                monitoringService.recordDependency('database', 'unavailable');
                throw err;
            }
        }
    }

    async runCollectionRound(): Promise<number> {
        let params: EstimateParameter | null;
        let services: ActiveService[];
        try {
            params = await this.repository.findActiveEstimateParameter();
            services = await this.repository.findActiveServices();
            monitoringService.recordDependency('database', 'available');
        } catch (err) {
            monitoringService.recordDependency('database', 'unavailable');
            throw err;
        }
        if (!params) throw new Error('Nenhum parâmetro de estimativa ativo');

        monitoringService.recordAttemptedServices(services.length);
        const outcomes = await Promise.allSettled(
            services.map((service) => this.collectService(service, params)),
        );

        let collected = 0;
        outcomes.forEach((outcome, i) => {
            if (outcome.status === 'fulfilled') {
                collected++;
                return;
            }
            monitoringService.recordRoundFailure();
            const reason = outcome.reason;
            const detail =
                reason instanceof ExternalApiError
                    ? `${reason.kind}${reason.status ? ` HTTP ${reason.status}` : ''}: ${reason.message}`
                    : `inesperado: ${String(reason)}`;
            console.error(
                `[collection] falha em ${services[i].external_id} (${services[i].metrics_path}) -> ${detail}`,
            );
        });
        return collected;
    }

    private async collectService(service: ActiveService, params: EstimateParameter): Promise<void> {
        try {
            const raw = await this.metrics.getMetrics(service.metrics_path);
            const metrics = this.processMetrics(raw);
            const e = this.calculateEmissions(metrics, params, service.carbon_intensity);

            const data = {
                service_id: service.id,
                estimate_parameter_id: params.id,
                metric_interval_seconds: metrics.collectionIntervalSeconds,
                cpu_percent: metrics.cpuPercent,
                memory_gb: metrics.memoryGb,
                disk_gb: metrics.diskGb,
                network_gb: metrics.networkGb,
                cpu_watts: e.cpuWatts,
                memory_watts: e.memoryWatts,
                disk_watts: e.diskWatts,
                network_watts: e.networkWatts,
                estimated_power_w: e.powerW,
                estimated_energy_kwh: e.energyKwh,
                carbon_intensity: service.carbon_intensity,
                estimated_co2e_g: e.co2eG,
            };
            try {
                const collectedAt = await this.repository.createCollection(data);
                monitoringService.recordDependency('database', 'available');
                monitoringService.recordSuccessfulCollection(collectedAt);
                await this.repository.updateStatus(service.id, 'available');
            } catch (err) {
                monitoringService.recordDependency('database', 'unavailable');
                throw err;
            }
        } catch (err) {
            const status = this.statusFromError(err);
            if (status) {
                try {
                    await this.repository.updateStatus(service.id, status);
                    monitoringService.recordDependency('database', 'available');
                } catch (databaseError) {
                    monitoringService.recordDependency('database', 'unavailable');
                    throw databaseError;
                }
            }
            throw err;
        }
    }

    private processMetrics(raw: MetricsResponse): ProcessedMetrics {
        return {
            cpuPercent: raw.metrics.cpu_percent,
            memoryGb: raw.metrics.memory_gb,
            diskGb: raw.metrics.disk_gb,
            networkGb: raw.metrics.network_gb,
            collectionIntervalSeconds: raw.collection_interval_seconds,
            collectionIntervalHours: raw.collection_interval_seconds / 3600,
        };
    }

    private calculateEmissions(
        m: ProcessedMetrics,
        p: EstimateParameter,
        carbonIntensity: number,
    ): Emissions {
        const cpuWatts = (m.cpuPercent / 100) * p.cpu_max_watts;
        const memoryWatts = m.memoryGb * p.ram_watts_per_gb;
        const diskWatts = m.diskGb * p.disk_watts_per_gb;
        const networkWatts = m.networkGb * p.network_watts_per_gb;

        const powerW = cpuWatts + memoryWatts + diskWatts + networkWatts;
        const energyKwh = (powerW * m.collectionIntervalHours) / 1000;
        const co2eG = energyKwh * carbonIntensity;

        return { cpuWatts, memoryWatts, diskWatts, networkWatts, powerW, energyKwh, co2eG };
    }

    private statusFromError(err: unknown): ServiceStatus | null {
        if (!(err instanceof ExternalApiError)) return null;

        if (err.kind === 'timeout' || err.kind === 'unavailable') {
            return 'unavailable';
        }

        if (err.kind !== 'bad_status') return null;

        if (err.status === 404) return 'unavailable';
        if (err.status === 500) return 'metrics_missing';

        return null;
    }
}

function createDefaultCollectionsService(): CollectionsService {
    const carbonUrl = process.env.CARBON_API_URL ?? process.env['CARBON_API_URL '];
    const metricsUrl = process.env.METRICS_API_URL;

    if (!carbonUrl || !metricsUrl) {
        throw new Error('URLs das APIs externas não configuradas');
    }

    return new CollectionsService(
        new CollectionsRepository(pool),
        new CarbonClient(carbonUrl),
        new MetricsClient(metricsUrl),
    );
}

export async function runCollectionRound(): Promise<number> {
    const service = createDefaultCollectionsService();
    await service.syncRegions();
    await service.syncServices();
    return service.runCollectionRound();
}
