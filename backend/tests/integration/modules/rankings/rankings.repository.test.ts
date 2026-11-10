import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { RankingsRepository } from '../../../../src/modules/rankings/rankings.repository.js';
import { RankingsService } from '../../../../src/modules/rankings/rankings.service.js';
import { createTestDatabase, testDatabaseUrl, type TestDatabase } from '../../helpers/database.js';

describe.skipIf(!testDatabaseUrl)('Ranking com PostgreSQL', () => {
    let database: TestDatabase;
    beforeAll(async () => {
        database = await createTestDatabase();
    }, 15000);
    afterAll(async () => {
        await database?.close();
    });

    it('deve retornar os totais do banco e excluir coletas fora do período', async () => {
        // 1. Executa o serviço com o repositório real, sem mocks.
        const service = new RankingsService(new RankingsRepository(database.pool));
        const result = await service.list({ criterion: 'co2eGrams', range: '24h' });

        // 2. Confere as somas conhecidas: B = 4/800; A = (1+2)/(100+200).
        expect(
            result.items.map(({ externalId, energyKwh, co2eGrams, sampleCount, position }) => ({
                externalId,
                energyKwh,
                co2eGrams,
                sampleCount,
                position,
            })),
        ).toEqual([
            { externalId: 'service-b', energyKwh: 4, co2eGrams: 800, sampleCount: 1, position: 1 },
            { externalId: 'service-a', energyKwh: 3, co2eGrams: 300, sampleCount: 2, position: 2 },
        ]);

        // 3. Consulta SQL independente para conferir os valores no mesmo intervalo.
        const sql = await database.pool.query(
            `
            SELECT s.external_id, SUM(c.energia_estimada_kwh)::float8 AS energy,
                SUM(c.co2e_estimado_g)::float8 AS carbon, COUNT(*)::int AS samples
            FROM coleta c JOIN servico s ON s.id=c.servico_id
            WHERE c.coletado_em > $1 AND c.coletado_em <= $2
            GROUP BY s.external_id
        `,
            [result.period.from, result.period.to],
        );
        for (const item of result.items) {
            const row = sql.rows.find((row) => row.external_id === item.externalId);
            expect(row).toEqual({
                external_id: item.externalId,
                energy: item.energyKwh,
                carbon: item.co2eGrams,
                samples: item.sampleCount,
            });
        }
    });
});
