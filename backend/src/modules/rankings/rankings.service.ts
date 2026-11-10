import type { RankingsRepository } from './rankings.repository.js';
import type { RankingsQuery } from './rankings.schema.js';
import type { RankingsResponseDto } from './types/rankings.types.js';

export class RankingsService {
    constructor(private readonly repository: RankingsRepository) {}

    async list({ criterion, range }: RankingsQuery): Promise<RankingsResponseDto> {
        const rangeHours = {
            '1h': 1,
            '6h': 6,
            '24h': 24,
            '7d': 7 * 24,
            '30d': 30 * 24,
        };
        const latestAt = await this.repository.findLatestCollectionAt();
        // Inclui a última coleta mesmo quando o PostgreSQL armazena microssegundos.
        const to = latestAt === null ? new Date() : new Date(latestAt.getTime() + 1);
        const from = new Date(to.getTime() - rangeHours[range] * 60 * 60 * 1000);
        const rows = await this.repository.findTotalsByPeriod(from, to);

        const items = rows.map((row) => ({
            externalId: row.external_id,
            name: row.nome,
            region: { code: row.region_code, city: row.city },
            energyKwh: row.energy_kwh,
            co2eGrams: row.co2e_grams,
            sampleCount: row.sample_count,
        }));

        // Os totais são não negativos; -1 coloca os serviços sem dados após o zero.
        items.sort(
            (a, b) =>
                (b[criterion] ?? -1) - (a[criterion] ?? -1) ||
                a.externalId.localeCompare(b.externalId),
        );

        return {
            criterion,
            range,
            period: { from: from.toISOString(), to: to.toISOString() },
            items: items.map((item, index) => ({
                position: item.sampleCount === 0 ? null : index + 1,
                ...item,
            })),
        };
    }
}
