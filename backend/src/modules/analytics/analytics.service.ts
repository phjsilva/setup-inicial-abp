import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { ServiceRepository } from '../services/services.repository.js';
import { AnalyticsRepository } from './analytics.repository.js';
import { CollectionsAnalyticsDto } from './analytics.types.js';

export class AnalyticsService {
    constructor(
        private readonly repository: AnalyticsRepository,
        private readonly service: ServiceRepository,
    ) {}

    async getCollectionsByExternalId(
        externalId: string,
        range: '1h' | '6h' | '24h' | '7d' | '30d' = '24h',
        maxPoints: number = 120,
        to?: Date,
    ): Promise<CollectionsAnalyticsDto> {
        const serviceId = await this.service.findIdByExternalId(externalId);

        if (serviceId === null) {
            throw new NotFoundError(`Serviço ${externalId} não foi encontrado`);
        }
        const latestAt = to
            ? null
            : await this.repository.findLatestCollectionAtByExternalId(externalId);
        const rangeHours = {
            '1h': 1,
            '6h': 6,
            '24h': 24,
            '7d': 7 * 24,
            '30d': 30 * 24,
        };

        const resolvedTo = to ?? (latestAt ? new Date(latestAt.getTime() + 1) : new Date());
        const resolvedFrom = new Date(resolvedTo.getTime() - rangeHours[range] * 60 * 60 * 1000);

        const bucketSeconds = Math.max(
            1,
            Math.ceil((resolvedTo.getTime() - resolvedFrom.getTime()) / 1000 / maxPoints),
        );

        const getPoints = await this.repository.findPointsByServiceId(
            serviceId,
            resolvedFrom,
            resolvedTo,
            bucketSeconds,
        );

        const getSummary = await this.repository.SummaryByServiceId(
            serviceId,
            resolvedFrom,
            resolvedTo,
        );

        return {
            generatedAt: new Date().toISOString(),
            serviceId: externalId,
            range,
            period: {
                from: resolvedFrom.toISOString(),
                to: resolvedTo.toISOString(),
            },
            maxPoints,
            bucketSeconds,
            summary: {
                sampleCount: getSummary.sample_count,
                energyKwh: getSummary.energy_kwh,
                co2eGrams: getSummary.co2e_grams,
            },
            points: getPoints.map((point) => ({
                timestamp: point.timestamp.toISOString(),
                sampleCount: point.sample_count,
                cpuPercent: point.cpu_percent,
                memoryGb: point.memory_gb,
                powerWatts: point.power_watts,
                co2ePerCollectionGrams: point.co2e_per_collection_grams,
                energyKwh: point.energy_kwh,
                co2eGrams: point.co2e_grams,
            })),
        };
    }
}
