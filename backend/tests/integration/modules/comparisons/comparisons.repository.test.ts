import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ComparisonsRepository } from '../../../../src/modules/comparisons/comparisons.repository.js';
import { ComparisonsService } from '../../../../src/modules/comparisons/comparisons.service.js';
import { ServiceRepository } from '../../../../src/modules/services/services.repository.js';
import { createTestDatabase, testDatabaseUrl, type TestDatabase } from '../../helpers/database.js';

describe.skipIf(!testDatabaseUrl)('Comparação com PostgreSQL', () => {
    let database: TestDatabase;
    beforeAll(async () => {
        database = await createTestDatabase();
    }, 15000);
    afterAll(async () => {
        await database?.close();
    });

    it('deve comparar dois serviços com os totais persistidos no período', async () => {
        // 1. Usa os dois repositórios reais para consultar o banco.
        const service = new ComparisonsService(
            new ComparisonsRepository(database.pool),
            new ServiceRepository(database.pool),
        );
        const result = await service.compare({
            range: '24h',
            selections: [
                { selectionId: 'a', externalId: 'service-a', simulatedRegionCode: null },
                { selectionId: 'b', externalId: 'service-b', simulatedRegionCode: null },
            ],
        });

        // 2. Verifica valores conhecidos, sem incluir a coleta antiga de 99 kWh.
        expect(result.series.map(({ selectionId, summary }) => ({ selectionId, summary }))).toEqual(
            [
                { selectionId: 'a', summary: { sampleCount: 2, energyKwh: 3, co2eGrams: 300 } },
                { selectionId: 'b', summary: { sampleCount: 1, energyKwh: 4, co2eGrams: 800 } },
            ],
        );

        // 3. Confere cada resumo com SQL e a soma dos pontos do gráfico.
        for (const series of result.series) {
            const externalId = series.selectionId === 'a' ? 'service-a' : 'service-b';
            const sql = await database.pool.query(
                `
                SELECT SUM(c.energia_estimada_kwh)::float8 AS energy,
                    SUM(c.co2e_estimado_g)::float8 AS carbon, COUNT(*)::int AS samples
                FROM coleta c JOIN servico s ON s.id=c.servico_id
                WHERE s.external_id=$1 AND c.coletado_em > $2 AND c.coletado_em <= $3
            `,
                [externalId, result.period.from, result.period.to],
            );
            expect(sql.rows[0]).toEqual({
                energy: series.summary.energyKwh,
                carbon: series.summary.co2eGrams,
                samples: series.summary.sampleCount,
            });
            expect(series.points.reduce((sum, point) => sum + (point.energyKwh ?? 0), 0)).toBe(
                series.summary.energyKwh,
            );
            expect(series.points.reduce((sum, point) => sum + (point.co2eGrams ?? 0), 0)).toBe(
                series.summary.co2eGrams,
            );
            expect(series.points.reduce((sum, point) => sum + point.sampleCount, 0)).toBe(
                series.summary.sampleCount,
            );
        }
    });
});
