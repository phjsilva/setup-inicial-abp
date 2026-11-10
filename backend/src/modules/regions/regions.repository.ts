import { Pool } from 'pg';
import type { RegionCardRow, RegionTotalsRow } from './types/regions.types.js';

export class RegionsRepository {
    constructor(private readonly pool: Pool) {}

    async findCards(): Promise<RegionCardRow[]> {
        const result = await this.pool.query<RegionCardRow>(
            `SELECT r.id,
                r.codigo,
                r.pais,
                r.regiao,
                r.cidade,
                r.latitude::float8,
                r.longitude::float8,
                r.carbon_intensity::float8,
                r.renewable_share_percent::float8,
                r.atualizado_em,
                COUNT(s.id)::int AS total_services,
                COUNT(*) FILTER (WHERE s.ativo)::int AS listed_services,
                COUNT(*) FILTER (WHERE NOT s.ativo)::int AS unlisted_services,
                COUNT(*) FILTER (WHERE s.status = 'available')::int AS available_services,
                COUNT(*) FILTER (WHERE s.status = 'metrics_missing')::int AS metrics_missing_services,
                COUNT(*) FILTER (WHERE s.status = 'unavailable')::int AS unavailable_services
         FROM regiao r
         LEFT JOIN servico s ON s.regiao_id = r.id
         GROUP BY r.id
         ORDER BY r.regiao, r.codigo`,
        );
        return result.rows;
    }

    async findTotalsByPeriod(from: Date, to: Date): Promise<RegionTotalsRow[]> {
        const result = await this.pool.query<RegionTotalsRow>(
            `SELECT s.regiao_id,
                COUNT(*)::int AS sample_count,
                SUM(c.energia_estimada_kwh)::float8 AS energy_kwh,
                SUM(c.co2e_estimado_g)::float8 AS co2e_grams
         FROM coleta c
         JOIN servico s ON s.id = c.servico_id
         WHERE c.coletado_em > $1::timestamptz
           AND c.coletado_em <= $2::timestamptz
         GROUP BY s.regiao_id`,
            [from, to],
        );
        return result.rows;
    }
}
