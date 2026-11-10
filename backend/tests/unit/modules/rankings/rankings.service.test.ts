import { describe, it, expect, vi } from 'vitest';
import { RankingsService } from '../../../../src/modules/rankings/rankings.service.js';
import type { RankingsRepository } from '../../../../src/modules/rankings/rankings.repository.js';
import type { RankingRow } from '../../../../src/modules/rankings/types/rankings.types.js';

describe('Listagem do ranking (RankingsService)', () => {
    it.each([
        { criterion: 'co2eGrams' as const, expectedIds: ['service-b', 'service-a'] },
        { criterion: 'energyKwh' as const, expectedIds: ['service-a', 'service-b'] },
    ])(
        'deve ordenar os serviços por $criterion do maior para o menor',
        async ({ criterion, expectedIds }) => {
            const mockRows: RankingRow[] = [
                {
                    external_id: 'service-a',
                    nome: 'Serviço A',
                    region_code: 'BR',
                    city: 'São Paulo',
                    energy_kwh: 5,
                    co2e_grams: 100,
                    sample_count: 2,
                },
                {
                    external_id: 'service-b',
                    nome: 'Serviço B',
                    region_code: 'US',
                    city: null,
                    energy_kwh: 2,
                    co2e_grams: 300,
                    sample_count: 3,
                },
            ];
            const mockRepo = {
                findLatestCollectionAt: vi.fn().mockResolvedValue(new Date('2026-11-06T12:00:00Z')),
                findTotalsByPeriod: vi.fn().mockResolvedValue(mockRows),
            } as unknown as RankingsRepository;
            const service = new RankingsService(mockRepo);

            const result = await service.list({ criterion, range: '24h' });

            expect(result.criterion).toBe(criterion);
            expect(result.range).toBe('24h');
            expect(result.items.map((item) => item.externalId)).toEqual(expectedIds);
            expect(result.items.map((item) => item.position)).toEqual([1, 2]);
            expect(result.items).toContainEqual({
                position: criterion === 'energyKwh' ? 1 : 2,
                externalId: 'service-a',
                name: 'Serviço A',
                region: { code: 'BR', city: 'São Paulo' },
                energyKwh: 5,
                co2eGrams: 100,
                sampleCount: 2,
            });
            expect(mockRepo.findTotalsByPeriod).toHaveBeenCalledTimes(1);
            expect(mockRepo.findTotalsByPeriod).toHaveBeenCalledWith(
                new Date('2026-11-05T12:00:00.001Z'),
                new Date('2026-11-06T12:00:00.001Z'),
            );
        },
    );

    it('deve colocar o serviço sem coletas depois do serviço com consumo zero e sem posição', async () => {
        const mockRows: RankingRow[] = [
            {
                external_id: 'service-empty',
                nome: 'Serviço sem coletas',
                region_code: 'BR',
                city: null,
                energy_kwh: null,
                co2e_grams: null,
                sample_count: 0,
            },
            {
                external_id: 'service-zero',
                nome: 'Serviço com consumo zero',
                region_code: 'BR',
                city: null,
                energy_kwh: 0,
                co2e_grams: 0,
                sample_count: 1,
            },
        ];
        const mockRepo = {
            findLatestCollectionAt: vi.fn().mockResolvedValue(new Date('2026-11-06T12:00:00Z')),
            findTotalsByPeriod: vi.fn().mockResolvedValue(mockRows),
        } as unknown as RankingsRepository;
        const service = new RankingsService(mockRepo);

        const result = await service.list({ criterion: 'co2eGrams', range: '24h' });

        expect(result.items[0]).toMatchObject({
            externalId: 'service-zero',
            position: 1,
            co2eGrams: 0,
            energyKwh: 0,
        });
        expect(result.items[1]).toMatchObject({
            externalId: 'service-empty',
            position: null,
            co2eGrams: null,
            energyKwh: null,
            sampleCount: 0,
        });
    });
});
