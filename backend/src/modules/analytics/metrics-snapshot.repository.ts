import type { Pool } from 'pg';
import { AppError } from '../../shared/errors/AppError.js';
import type { SnapshotRange } from './metrics-snapshot.schema.js';
import type {
    MetricPoint,
    MetricService,
    MetricsSnapshot,
} from './types/metrics-snapshot.types.js';

const rangeHours = { '1h': 1, '6h': 6, '24h': 24, '7d': 168, '30d': 720 };
const aggregate = `count(c.id)::int AS samples, sum(c.energia_estimada_kwh)::float8 AS energy,
    sum(c.co2e_estimado_g)::float8 AS carbon, avg(c.cpu_percent)::float8 AS cpu,
    avg(c.memory_gb)::float8 AS memory, avg(c.potencia_estimada_w)::float8 AS power`;

export class MetricsSnapshotRepository {
    constructor(private readonly pool: Pool) {}
    async load(
        range: SnapshotRange,
        serviceIds?: string[],
        end = new Date(),
    ): Promise<MetricsSnapshot> {
        const start = new Date(end.getTime() - rangeHours[range] * 3_600_000);
        const seconds = Math.ceil((rangeHours[range] * 3600) / 48);
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
            const args = [start, end, serviceIds ?? null];
            const selected = '($3::text[] IS NULL AND s.ativo OR s.external_id = ANY($3::text[]))';
            const metrics = await client.query<MetricService>(
                `SELECT s.external_id AS id, s.nome AS name, s.status, s.ativo AS active,
                max(c.coletado_em) AS "collectedAt", r.codigo AS "regionCode", r.regiao AS region,
                r.carbon_intensity::float8 AS intensity, ${aggregate}
             FROM servico s JOIN regiao r ON r.id = s.regiao_id
             LEFT JOIN coleta c ON c.servico_id = s.id AND c.coletado_em > $1 AND c.coletado_em <= $2
             WHERE ${selected}
             GROUP BY s.id, r.id ORDER BY s.nome, s.id`,
                args,
            );
            if (serviceIds && metrics.rows.length !== serviceIds.length) {
                throw new AppError('Um dos serviços selecionados não existe.', 400);
            }
            const points = await client.query<MetricPoint>(
                `SELECT date_bin($4::integer * interval '1 second', c.coletado_em - interval '1 microsecond',
                       $1::timestamptz) AS time, ${aggregate}
             FROM coleta c JOIN servico s ON s.id = c.servico_id
             WHERE c.coletado_em > $1 AND c.coletado_em <= $2 AND ${selected}
             GROUP BY time ORDER BY time`,
                [...args, seconds],
            );
            await client.query('COMMIT');
            return {
                range,
                start,
                end,
                services: metrics.rows,
                points: points.rows,
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}
