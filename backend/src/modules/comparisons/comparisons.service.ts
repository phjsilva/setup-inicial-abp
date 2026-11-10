import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import type { ServiceRepository } from '../services/services.repository.js';
import type { ComparisonsRepository } from './comparisons.repository.js';
import type { CreateComparisonInput } from './comparisons.schema.js';
import type { ComparisonResponseDto, ComparisonSeriesDto } from './types/comparisons.types.js';

export class ComparisonsService {
    constructor(
        private readonly repository: ComparisonsRepository,
        private readonly serviceRepository: ServiceRepository,
    ) {}

    async compare(input: CreateComparisonInput): Promise<ComparisonResponseDto> {
        const rangeHours = {
            '1h': 1,
            '6h': 6,
            '24h': 24,
            '7d': 7 * 24,
            '30d': 30 * 24,
        };

        const selections = [];
        for (const selection of input.selections) {
            const serviceId = await this.serviceRepository.findIdByExternalId(selection.externalId);

            if (serviceId === null) {
                throw new NotFoundError(`Serviço ${selection.externalId} não foi encontrado`);
            }

            selections.push({ ...selection, serviceId });
        }

        const latestAt = await this.repository.findLatestCollectionAtByServiceIds(
            selections.map((selection) => selection.serviceId),
        );
        // Inclui a última coleta mesmo quando o PostgreSQL armazena microssegundos.
        const to = latestAt === null ? new Date() : new Date(latestAt.getTime() + 1);
        const durationSeconds = rangeHours[input.range] * 60 * 60;
        const from = new Date(to.getTime() - durationSeconds * 1000);
        const bucketSeconds = durationSeconds / 120;
        const series: ComparisonSeriesDto[] = [];

        for (const selection of selections) {
            let carbonIntensity: number | null = null;

            if (selection.simulatedRegionCode !== null) {
                const region = await this.repository.findRegionByCode(
                    selection.simulatedRegionCode,
                );

                if (region === null) {
                    throw new NotFoundError(
                        `Região ${selection.simulatedRegionCode} não foi encontrada`,
                    );
                }

                carbonIntensity = region.carbon_intensity;
            }

            const summary = await this.repository.findSummaryByServiceId(
                selection.serviceId,
                from,
                to,
            );
            const points = await this.repository.findPointsByServiceId(
                selection.serviceId,
                from,
                to,
                bucketSeconds,
            );

            let co2eGrams = summary.co2e_grams;

            if (carbonIntensity !== null) {
                co2eGrams =
                    summary.energy_kwh === null ? null : summary.energy_kwh * carbonIntensity;
            }

            series.push({
                selectionId: selection.selectionId,
                summary: {
                    sampleCount: summary.sample_count,
                    energyKwh: summary.energy_kwh,
                    co2eGrams,
                },
                points: points.map((point) => {
                    let pointCo2eGrams = point.co2e_grams;

                    if (carbonIntensity !== null) {
                        pointCo2eGrams =
                            point.energy_kwh === null ? null : point.energy_kwh * carbonIntensity;
                    }

                    return {
                        timestamp: point.timestamp.toISOString(),
                        sampleCount: point.sample_count,
                        energyKwh: point.energy_kwh,
                        co2eGrams: pointCo2eGrams,
                    };
                }),
            });
        }

        return {
            range: input.range,
            period: {
                from: from.toISOString(),
                to: to.toISOString(),
            },
            series,
        };
    }
}
