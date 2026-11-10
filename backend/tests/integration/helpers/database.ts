import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { Pool } from 'pg';

export const testDatabaseUrl = process.env.TEST_DATABASE_URL;

export async function createTestDatabase() {
    if (!testDatabaseUrl)
        throw new Error('Informe TEST_DATABASE_URL para executar os testes de banco.');

    // Cada arquivo usa um banco novo; nenhum teste limpa tabelas de um banco existente.
    const databaseName = `greener_test_${randomUUID().replaceAll('-', '')}`;
    const admin = new Pool({ connectionString: testDatabaseUrl });
    await admin.query(`CREATE DATABASE ${databaseName}`);
    const url = new URL(testDatabaseUrl);
    url.pathname = `/${databaseName}`;
    const connectionString = url.toString();
    const pool = new Pool({ connectionString });

    async function close() {
        await pool.end();
        await admin.query(`DROP DATABASE ${databaseName}`);
        await admin.end();
    }

    try {
        // Usa o schema real do projeto, incluindo suas restrições e índices.
        await pool.query(
            await readFile(new URL('../../../../database/schema.sql', import.meta.url), 'utf8'),
        );
        await pool.query(`
            INSERT INTO regiao (codigo,pais,regiao,carbon_intensity,renewable_share_percent)
            VALUES ('BR','Brasil','Sudeste',100,80);
            INSERT INTO servico (external_id,nome,metrics_path,regiao_id)
            SELECT external_id,nome,'/metrics',r.id
            FROM (VALUES ('service-a','Serviço A'),('service-b','Serviço B')) AS s(external_id,nome)
            CROSS JOIN regiao r;
            INSERT INTO coleta (
                servico_id,parametro_estimativa_id,coletado_em,intervalo_metrica_segundos,
                cpu_percent,memory_gb,disk_gb,network_gb,
                cpu_watts,memory_watts,disk_watts,network_watts,
                potencia_estimada_w,energia_estimada_kwh,carbon_intensity,co2e_estimado_g
            )
            SELECT s.id,p.id,v.data::timestamptz,3600,50,0,0,0,
                v.energia*1000,0,0,0,v.energia*1000,v.energia,v.carbono/v.energia,v.carbono
            FROM (VALUES
                ('service-a','2026-11-06 11:00:00+00',1,100),
                ('service-a','2026-11-06 12:00:00+00',2,200),
                ('service-b','2026-11-06 11:30:00+00',4,800),
                ('service-a','2026-11-04 12:00:00+00',99,9900)
            ) AS v(external_id,data,energia,carbono)
            JOIN servico s ON s.external_id=v.external_id
            CROSS JOIN parametro_estimativa p;
        `);
        return { pool, connectionString, close };
    } catch (error) {
        await pool.query('ROLLBACK');
        await close();
        throw error;
    }
}

export type TestDatabase = Awaited<ReturnType<typeof createTestDatabase>>;
