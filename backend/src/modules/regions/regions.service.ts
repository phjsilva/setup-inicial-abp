import { RegionsRepository } from './regions.repository.js';
import type { RegionsQuery } from './regions.schema.js';
import type {
    PeriodSummaryDto,
    RegionCardDto,
    RegionCardRow,
    RegionsResponseDto,
    RegionTotalsRow,
} from './types/regions.types.js';

const round = (value: number, decimals: number) => Number(value.toFixed(decimals));
const toIso = (date: Date) => date.toISOString().replace(/\.\d{3}Z$/, 'Z');

export class RegionsService {
    constructor(private readonly repository: RegionsRepository) {}

    async list(filters: RegionsQuery): Promise<RegionsResponseDto> {
        const rows = await this.repository.findCards();

        const hasPeriod = filters.from !== undefined && filters.to !== undefined;

        const totalsByRegionId = new Map<string, RegionTotalsRow>();
        if (hasPeriod) {
            const totals = await this.repository.findTotalsByPeriod(filters.from!, filters.to!);
            for (const total of totals) {
                totalsByRegionId.set(total.regiao_id, total);
            }
        }

        const period = hasPeriod ? { from: toIso(filters.from!), to: toIso(filters.to!) } : null;

        return {
            generatedAt: toIso(new Date()),
            period,
            regions: rows.map((row) => {
                const periodSummary = hasPeriod
                    ? this.toPeriodSummary(totalsByRegionId.get(row.id) ?? null)
                    : null;
                return this.toCard(row, periodSummary);
            }),
        };
    }

    private toCard(row: RegionCardRow, periodSummary: PeriodSummaryDto | null): RegionCardDto {
        return {
            code: row.codigo,
            country: row.pais,
            region: row.regiao,
            city: row.cidade,
            latitude: row.latitude === null ? null : round(row.latitude, 2),
            longitude: row.longitude === null ? null : round(row.longitude, 2),
            carbonIntensityGco2ePerKwh: row.carbon_intensity,
            renewableSharePercent: row.renewable_share_percent,
            carbonFactorUpdatedAt: toIso(row.atualizado_em),
            serviceCounts: {
                totalServices: row.total_services,
                listedServices: row.listed_services,
                availableServices: row.available_services,
                metricsMissingServices: row.metrics_missing_services,
                unavailableServices: row.unavailable_services,
                unlistedServices: row.unlisted_services,
            },
            periodSummary,
        };
    }

    private toPeriodSummary(totals: RegionTotalsRow | null): PeriodSummaryDto {
        return {
            sampleCount: totals?.sample_count ?? 0,
            energyKwh: totals?.energy_kwh != null ? round(totals.energy_kwh, 10) : null,
            co2eGrams: totals?.co2e_grams != null ? round(totals.co2e_grams, 7) : null,
            basis: 'sum_of_stored_samples',
        };
    }
}
