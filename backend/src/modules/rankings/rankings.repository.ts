import { Pool } from 'pg';
import type { RankingRow } from './types/rankings.types.js';

export class RankingsRepository {
    constructor(private readonly pool: Pool) {}

    async findLatestCollectionAt(): Promise<Date | null> {
        const result = await this.pool.query<{ latest_at: Date | null }>(
            'SELECT MAX(coletado_em) AS latest_at FROM coleta',
        );
        return result.rows[0]?.latest_at ?? null;
    }

    async findTotalsByPeriod(from: Date, to: Date): Promise<RankingRow[]> {
        const result = await this.pool.query<RankingRow>(
            `
            SELECT
                s.external_id,
                s.nome,
                r.codigo AS region_code,
                r.cidade AS city,
                COUNT(c.id)::integer AS sample_count,
                SUM(c.energia_estimada_kwh)::float8 AS energy_kwh,
                SUM(c.co2e_estimado_g)::float8 AS co2e_grams
            FROM servico s
            JOIN regiao r ON r.id = s.regiao_id
            LEFT JOIN coleta c
                ON c.servico_id = s.id
                AND c.coletado_em > $1::timestamptz
                AND c.coletado_em <= $2::timestamptz
            GROUP BY s.id, r.id
            `,
            [from, to],
        );
        return result.rows;
    }
}
