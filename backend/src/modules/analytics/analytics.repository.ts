import { Pool } from 'pg';
import { CollectionPointRow, SumaryRow } from './analytics.types.js';

export class AnalyticsRepository {
    constructor(private readonly pool: Pool) {}

    async findPointsByServiceId(
        serviceId: string,
        from: Date,
        to: Date,
        bucketSeconds: number,
    ): Promise<CollectionPointRow[]> {
        const result = await this.pool.query<CollectionPointRow>(
            `
        SELECT
            DATE_BIN(
                $4::integer * INTERVAL '1 second',
                coletado_em - INTERVAL '1 microsecond',
                $2::timestamptz
            ) AS timestamp,

            COUNT(*)::integer AS sample_count,

            AVG(cpu_percent)::float8 AS cpu_percent,
            AVG(memory_gb)::float8 AS memory_gb,
            AVG(potencia_estimada_w)::float8 AS power_watts,
            AVG(co2e_estimado_g)::float8 AS co2e_per_collection_grams,

            SUM(energia_estimada_kwh)::float8 AS energy_kwh,
            SUM(co2e_estimado_g)::float8 AS co2e_grams

        FROM coleta

        WHERE servico_id = $1
          AND coletado_em > $2::timestamptz
          AND coletado_em <= $3::timestamptz

        GROUP BY timestamp
        ORDER BY timestamp
        `,
            [serviceId, from, to, bucketSeconds],
        );

        return result.rows;
    }

    async SummaryByServiceId(serviceId: string, from: Date, to: Date): Promise<SumaryRow> {
        const result = await this.pool.query<SumaryRow>(
            `
        SELECT COUNT(*)::integer AS sample_count,SUM(energia_estimada_kwh)::float8 AS energy_kwh,SUM(co2e_estimado_g)::float8 AS co2e_grams
        FROM coleta
        WHERE servico_id = $1
        AND coletado_em > $2::timestamptz
        AND coletado_em <= $3::timestamptz;
            `,
            [serviceId, from, to],
        );
        return result.rows[0];
    }

    async findLatestCollectionAtByExternalId(externalId: string): Promise<Date | null> {
        const result = await this.pool.query<{ coletado_em: Date }>(
            `
        SELECT coletado_em
        FROM coleta
        WHERE servico_id = (
            SELECT id
            FROM servico
            WHERE external_id = $1
        )
        ORDER BY coletado_em DESC
        LIMIT 1
        `,
            [externalId],
        );

        return result.rows[0]?.coletado_em ?? null;
    }
}
