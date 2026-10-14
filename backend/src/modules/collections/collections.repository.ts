import { Pool } from 'pg';
import {
    ActiveService,
    Collection,
    EstimateParameter,
    RegionEnergyInfo,
    Service,
    ServiceStatus,
    type Region,
} from './collections.types.js';

export class CollectionsRepository {
    constructor(private readonly pool: Pool) {}

    async createRegion(data: Region): Promise<void> {
        await this.pool.query(
            `INSERT INTO regiao
       (codigo, pais, regiao, cidade, latitude, longitude, carbon_intensity, renewable_share_percent)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                data.code,
                data.country,
                data.region,
                data.city ?? null,
                data.latitude,
                data.longitude,
                data.carbon_intensity_gco2e_per_kwh,
                data.renewable_share_percent,
            ],
        );
    }
    async createService(data: Service): Promise<void> {
        await this.pool.query(
            `INSERT INTO servico (external_id, nome, metrics_path, regiao_id)
     VALUES ($1, $2, $3, (SELECT id FROM regiao WHERE codigo = $4))`,
            [data.id, data.name, data.metrics_path, data.location.region_code],
        );
    }

    async createCollection(data: Collection): Promise<Date> {
        const result = await this.pool.query<{ coletado_em: Date }>(
            `INSERT INTO coleta
       (servico_id, parametro_estimativa_id, coletado_em, intervalo_metrica_segundos,
        cpu_percent, memory_gb, disk_gb, network_gb,
        cpu_watts, memory_watts, disk_watts, network_watts,
        potencia_estimada_w, energia_estimada_kwh, carbon_intensity, co2e_estimado_g)
     VALUES
       ($1, $2, COALESCE($3, now()), $4,
        $5, $6, $7, $8,
        $9, $10, $11, $12,
        $13, $14, $15, $16)
     RETURNING coletado_em`,
            [
                data.service_id,
                data.estimate_parameter_id,
                data.collected_at ?? null,
                data.metric_interval_seconds,
                data.cpu_percent,
                data.memory_gb,
                data.disk_gb,
                data.network_gb,
                data.cpu_watts,
                data.memory_watts,
                data.disk_watts,
                data.network_watts,
                data.estimated_power_w,
                data.estimated_energy_kwh,
                data.carbon_intensity,
                data.estimated_co2e_g,
            ],
        );
        return result.rows[0].coletado_em;
    }

    async existsByCode(code: string): Promise<boolean> {
        const result = await this.pool.query(`SELECT 1 FROM regiao WHERE codigo = $1`, [code]);
        return (result.rowCount ?? 0) > 0;
    }

    async findActiveEstimateParameter(): Promise<EstimateParameter | null> {
        const result = await this.pool.query<EstimateParameter>(
            `SELECT id,
        cpu_max_watts::float8 AS cpu_max_watts,
        ram_watts_per_gb::float8 AS ram_watts_per_gb,
        disk_watts_per_gb::float8 AS disk_watts_per_gb,
        network_watts_per_gb::float8 AS network_watts_per_gb,
        ativo AS active
 FROM parametro_estimativa
 WHERE ativo = true`,
        );
        return result.rows[0] ?? null;
    }

    async findEnergyInfoByCode(code: string): Promise<RegionEnergyInfo | null> {
        const result = await this.pool.query<RegionEnergyInfo>(
            `SELECT carbon_intensity::float8 AS carbon_intensity,renewable_share_percent::float8 AS renewable_share_percent
            FROM regiao
            WHERE codigo = $1`,
            [code],
        );
        return result.rows[0] ?? null;
    }

    async updateDiscoveredService(externalId: string, regionCode: string): Promise<void> {
        const result = await this.pool.query(
            `
        UPDATE servico
        SET regiao_id = (
                SELECT id FROM regiao WHERE codigo = $2
            ),
            ativo = true,
            ultima_vez_visto_em = now()
        WHERE external_id = $1
        `,
            [externalId, regionCode],
        );

        if (result.rowCount !== 1) {
            throw new Error(`Serviço não encontrado: ${externalId}`);
        }
    }

    async updateRegion(data: Region): Promise<boolean> {
        const result = await this.pool.query(
            `UPDATE regiao
         SET carbon_intensity = $2,
             renewable_share_percent = $3,
             atualizado_em = now()
         WHERE codigo = $1
           AND (carbon_intensity, renewable_share_percent)
               IS DISTINCT FROM ($2::numeric, $3::numeric)`,
            [data.code, data.carbon_intensity_gco2e_per_kwh, data.renewable_share_percent],
        );
        return (result.rowCount ?? 0) > 0;
    }

    async findActiveServices(): Promise<ActiveService[]> {
        const result = await this.pool.query<ActiveService>(
            `SELECT s.id,
                s.external_id,
                s.metrics_path,
                r.carbon_intensity::float8 AS carbon_intensity
         FROM servico s
         JOIN regiao r ON r.id = s.regiao_id
         WHERE s.ativo = true
         ORDER BY s.id`,
        );
        return result.rows;
    }

    async existsServiceByExternalId(externalId: string): Promise<boolean> {
        const result = await this.pool.query(`SELECT 1 FROM servico WHERE external_id = $1`, [
            externalId,
        ]);
        return (result.rowCount ?? 0) > 0;
    }

    async updateStatus(id: string, status: ServiceStatus): Promise<boolean> {
        const result = await this.pool.query(
            `UPDATE servico
         SET status = $1,
             status_atualizado_em = now()
         WHERE id = $2
           AND status <> $1`,
            [status, id],
        );
        return (result.rowCount ?? 0) > 0;
    }

    async deactivateMissingServices(
        discoveredIds: string[],
    ): Promise<Pick<ActiveService, 'id' | 'external_id'>[]> {
        const result = await this.pool.query<Pick<ActiveService, 'id' | 'external_id'>>(
            `
        UPDATE servico
        SET ativo = false
        WHERE NOT (external_id = ANY($1::text[]))
          AND (ativo = true OR status <> 'unavailable')
        RETURNING id, external_id
        `,
            [discoveredIds],
        );
        return result.rows;
    }
}
