import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { CollectionsRepository } from '../../../../src/modules/collections/collections.repository.js';
import { ServiceRepository } from '../../../../src/modules/services/services.repository.js';
import { ServicesService } from '../../../../src/modules/services/services.service.js';
import { createTestDatabase, testDatabaseUrl, type TestDatabase } from '../../helpers/database.js';

describe.skipIf(!testDatabaseUrl)('Histórico de status com PostgreSQL', () => {
    let database: TestDatabase;
    beforeAll(async () => {
        database = await createTestDatabase();
    }, 15000);
    afterAll(async () => {
        await database?.close();
    });

    it('deve persistir sucesso e falha e permitir consultar em outra conexão', async () => {
        // 1. Grava o histórico usando o repositório real de coletas.
        const repository = new CollectionsRepository(database.pool);
        const collection = (
            await database.pool.query(
                "SELECT id,servico_id FROM coleta WHERE coletado_em='2026-11-06 12:00:00+00'",
            )
        ).rows[0];
        await repository.createStatusCollection({
            service_id: collection.servico_id,
            coleta_id: collection.id,
            descricao: 'Coleta salva.',
            http_status: null,
            tipo: 'success',
        });
        await repository.createStatusCollection({
            service_id: collection.servico_id,
            descricao: 'API indisponível.',
            http_status: 503,
            tipo: 'bad_status',
        });
        await database.pool.query(`UPDATE status_coleta SET observado_em = CASE
            WHEN tipo='success' THEN '2026-11-06 12:00:00+00'::timestamptz
            ELSE '2026-11-06 12:01:00+00'::timestamptz END`);

        // 2. Outra conexão deve enxergar os registros já salvos.
        const reader = new Pool({ connectionString: database.connectionString });
        try {
            const service = new ServicesService(new ServiceRepository(reader));
            const result = await service.getCollectionStatusHistory('service-a');
            expect(result).toEqual({
                externalId: 'service-a',
                items: [
                    {
                        id: expect.any(String),
                        observedAt: new Date('2026-11-06T12:01:00Z'),
                        result: 'failure',
                        type: 'bad_status',
                        description: 'API indisponível.',
                        httpStatus: 503,
                    },
                    {
                        id: expect.any(String),
                        observedAt: new Date('2026-11-06T12:00:00Z'),
                        result: 'success',
                        type: 'success',
                        description: 'Coleta salva.',
                        httpStatus: null,
                    },
                ],
            });
            // 3. Confere também a ligação do sucesso com a coleta no banco.
            const saved = await reader.query(
                'SELECT tipo,coleta_id FROM status_coleta ORDER BY observado_em DESC',
            );
            expect(saved.rows).toEqual([
                { tipo: 'bad_status', coleta_id: null },
                { tipo: 'success', coleta_id: collection.id },
            ]);
        } finally {
            await reader.end();
        }
    });
});
