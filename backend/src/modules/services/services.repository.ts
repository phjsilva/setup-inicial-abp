import { Pool } from 'pg';
import { CollectionRow, ServiceRow } from './services.types.js';

export class ServiceRepository {
    constructor(private readonly pool: Pool) {}

    async findWithRegionByExternalId(externalId: string): Promise<ServiceRow | null> {
        const result = await this.pool.query<ServiceRow>(
            `
        select s.id, s.external_id,s.nome,s.ativo,s.status,s.ultima_vez_visto_em,r.codigo,r.pais,r.regiao,r.cidade,r.latitude::float8,r.longitude::float8,r.carbon_intensity::float8 from servico s
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
