import { Pool } from 'pg';
import { CollectionPointRow, CollectionSummaryRow, RegionRow } from './types/comparisons.types.js';

export class ComparisonsRepository {
    constructor(private readonly pool: Pool) {}

    async findLatestCollectionAtByServiceIds(serviceIds: string[]): Promise<Date | null> {
        const result = await this.pool.query<{ latest_at: Date | null }>(
            `
            SELECT MAX(coletado_em) AS latest_at
            FROM coleta
            WHERE servico_id = ANY($1::bigint[])
            `,
            [serviceIds],
        );

        return result.rows[0]?.latest_at ?? null;
    }

    async findSummaryByServiceId(
        serviceId: string,
        from: Date,
        to: Date,
    ): Promise<CollectionSummaryRow> {
        const result = await this.pool.query<CollectionSummaryRow>(
            `
            SELECT
                COUNT(*)::integer AS sample_count,
                SUM(energia_estimada_kwh)::float8 AS energy_kwh,
                SUM(co2e_estimado_g)::float8 AS co2e_grams
            FROM coleta
            WHERE servico_id = $1
              AND coletado_em > $2::timestamptz
              AND coletado_em <= $3::timestamptz
            `,
            [serviceId, from, to],
        );

        return result.rows[0];
    }

    async findRegionByCode(regionCode: string): Promise<RegionRow | null> {
        const result = await this.pool.query<RegionRow>(
            `
            SELECT
                codigo,
                carbon_intensity::float8 AS carbon_intensity
            FROM regiao
            WHERE codigo = $1
            `,
            [regionCode],
        );

        return result.rows[0] ?? null;
    }

    async findPointsByServiceId(
        serviceId: string,
        from: Date,
        to: Date,
        bucketSeconds: number,
    ): Promise<CollectionPointRow[]> {
        const result = await this.pool.query<CollectionPointRow>(
            `
        WITH slots AS (
    SELECT timestamp
    FROM generate_series(
        $2::timestamptz,
        $3::timestamptz,
        $4::integer * INTERVAL '1 second'
    ) AS grid(timestamp)
    WHERE timestamp < $3::timestamptz
    )
    SELECT
        slots.timestamp,
        COUNT(c.id)::integer AS sample_count,
        SUM(c.energia_estimada_kwh)::float8 AS energy_kwh,
        SUM(c.co2e_estimado_g)::float8 AS co2e_grams
    FROM slots
    LEFT JOIN coleta c
        ON c.servico_id = $1
        AND c.coletado_em > slots.timestamp
        AND c.coletado_em <= LEAST(
        slots.timestamp + $4::integer * INTERVAL '1 second',
        $3::timestamptz
    )
    GROUP BY slots.timestamp
    ORDER BY slots.timestamp
        `,
            [serviceId, from, to, bucketSeconds],
        );

        return result.rows;
    }
}
