import { Pool } from 'pg';
import { CollectionRow, ServiceRow } from './services.types.js';
import type { ServicesFilters } from './services.schema.js';

export class ServiceRepository {
    constructor(private readonly pool: Pool) {}

    async findAllWithLatest(
        filters: ServicesFilters,
    ): Promise<(ServiceRow & Partial<CollectionRow>)[]> {
        const result = await this.pool.query<ServiceRow & Partial<CollectionRow>>(
            `SELECT s.id, s.external_id, s.nome, s.ativo, s.status, s.status_atualizado_em,
                s.ultima_vez_visto_em, r.codigo, r.pais, r.regiao, r.cidade,
                r.latitude::float8, r.longitude::float8, r.carbon_intensity::float8,
                c.coletado_em, c.intervalo_metrica_segundos::float8,
                c.cpu_percent::float8, c.memory_gb::float8, c.disk_gb::float8, c.network_gb::float8,
                c.potencia_estimada_w::float8, c.energia_estimada_kwh::float8,
                c.carbon_intensity::float8 AS collection_carbon_intensity, c.co2e_estimado_g::float8
             FROM servico s
             LEFT JOIN regiao r ON r.id = s.regiao_id
             LEFT JOIN LATERAL (
                 SELECT * FROM coleta WHERE servico_id = s.id ORDER BY coletado_em DESC LIMIT 1
             ) c ON true
             WHERE ($1::text IS NULL OR r.codigo = $1)
               AND ($2::boolean IS NULL OR s.ativo = $2)
             ORDER BY s.nome, s.external_id`,
            [filters.regionCode ?? null, filters.active ?? null],
        );
        return result.rows;
    }

    async findWithRegionByExternalId(externalId: string): Promise<ServiceRow | null> {
        const result = await this.pool.query<ServiceRow>(
            `
        select s.id, s.external_id,s.nome,s.ativo,s.status,s.status_atualizado_em,s.ultima_vez_visto_em,r.codigo,r.pais,r.regiao,r.cidade,r.latitude::float8,r.longitude::float8,r.carbon_intensity::float8 from servico s
        left join  regiao r on s.regiao_id = r.id
        where s.external_id = $1`,
            [externalId],
        );
        return result.rows[0] ?? null;
    }

    async findLatestByServiceId(servico_id: string): Promise<CollectionRow | null> {
        const result = await this.pool.query<CollectionRow>(
            `
            select coletado_em, intervalo_metrica_segundos::float8, cpu_percent::float8,memory_gb::float8,disk_gb::float8,network_gb::float8,potencia_estimada_w::float8,energia_estimada_kwh::float8,carbon_intensity::float8,co2e_estimado_g::float8
            from coleta
            where servico_id = $1
            order by coletado_em
            desc limit 1
            `,
            [servico_id],
        );
        return result.rows[0] ?? null;
    }

    async findIdByExternalId(externalId: string): Promise<string | null> {
        const result = await this.pool.query<{ id: string }>(
            `SELECT id FROM servico WHERE external_id = $1`,
            [externalId],
        );

        return result.rows[0]?.id ?? null;
    }
}
