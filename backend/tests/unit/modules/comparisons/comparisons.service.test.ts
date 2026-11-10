import { describe, it, expect, vi } from 'vitest';
import { ComparisonsService } from '../../../../src/modules/comparisons/comparisons.service.js';
import type { ComparisonsRepository } from '../../../../src/modules/comparisons/comparisons.repository.js';
import type { ServiceRepository } from '../../../../src/modules/services/services.repository.js';

describe('Comparação de serviços (ComparisonsService)', () => {
    it('deve retornar os totais esperados para dois serviços', async () => {
        const mockServiceRepo = {
            findIdByExternalId: vi.fn().mockResolvedValueOnce('1').mockResolvedValueOnce('2'),
        } as unknown as ServiceRepository;
        const mockRepo = {
            findLatestCollectionAtByServiceIds: vi
                .fn()
                .mockResolvedValue(new Date('2026-11-06T12:00:00Z')),
            findSummaryByServiceId: vi
                .fn()
                .mockResolvedValueOnce({ sample_count: 2, energy_kwh: 5, co2e_grams: 100 })
                .mockResolvedValueOnce({ sample_count: 3, energy_kwh: 2, co2e_grams: 300 }),
            findPointsByServiceId: vi.fn().mockResolvedValue([]),
        } as unknown as ComparisonsRepository;
        const service = new ComparisonsService(mockRepo, mockServiceRepo);

        const result = await service.compare({
            range: '24h',
            selections: [
                { selectionId: 'selection-a', externalId: 'service-a', simulatedRegionCode: null },
                { selectionId: 'selection-b', externalId: 'service-b', simulatedRegionCode: null },
            ],
        });

        expect(result.range).toBe('24h');
        expect(result.series).toEqual([
            {
                selectionId: 'selection-a',
                summary: { sampleCount: 2, energyKwh: 5, co2eGrams: 100 },
                points: [],
            },
            {
                selectionId: 'selection-b',
                summary: { sampleCount: 3, energyKwh: 2, co2eGrams: 300 },
                points: [],
            },
        ]);
        expect(mockServiceRepo.findIdByExternalId).toHaveBeenNthCalledWith(1, 'service-a');
        expect(mockServiceRepo.findIdByExternalId).toHaveBeenNthCalledWith(2, 'service-b');
        expect(mockRepo.findLatestCollectionAtByServiceIds).toHaveBeenCalledWith(['1', '2']);
        expect(mockRepo.findSummaryByServiceId).toHaveBeenCalledTimes(2);
        expect(mockRepo.findSummaryByServiceId).toHaveBeenNthCalledWith(
            1,
            '1',
            new Date('2026-11-05T12:00:00.001Z'),
            new Date('2026-11-06T12:00:00.001Z'),
        );
        expect(mockRepo.findSummaryByServiceId).toHaveBeenNthCalledWith(
            2,
            '2',
            new Date('2026-11-05T12:00:00.001Z'),
            new Date('2026-11-06T12:00:00.001Z'),
        );
    });

    it('deve informar erro quando um serviço da comparação não existir', async () => {
        const mockServiceRepo = {
            findIdByExternalId: vi.fn().mockResolvedValueOnce('1').mockResolvedValueOnce(null),
        } as unknown as ServiceRepository;
        const mockRepo = {
            findLatestCollectionAtByServiceIds: vi.fn(),
            findSummaryByServiceId: vi.fn(),
        } as unknown as ComparisonsRepository;
        const service = new ComparisonsService(mockRepo, mockServiceRepo);

        await expect(
            service.compare({
                range: '24h',
                selections: [
                    { selectionId: 'a', externalId: 'service-a', simulatedRegionCode: null },
                    { selectionId: 'b', externalId: 'inexistente', simulatedRegionCode: null },
                ],
            }),
        ).rejects.toThrow('Serviço inexistente não foi encontrado');
        expect(mockServiceRepo.findIdByExternalId).toHaveBeenNthCalledWith(2, 'inexistente');
        expect(mockRepo.findLatestCollectionAtByServiceIds).not.toHaveBeenCalled();
        expect(mockRepo.findSummaryByServiceId).not.toHaveBeenCalled();
    });

    it('deve informar erro quando a região simulada não existir', async () => {
        const mockServiceRepo = {
            findIdByExternalId: vi.fn().mockResolvedValueOnce('1').mockResolvedValueOnce('2'),
        } as unknown as ServiceRepository;
        const mockRepo = {
            findLatestCollectionAtByServiceIds: vi
                .fn()
                .mockResolvedValue(new Date('2026-11-06T12:00:00Z')),
            findRegionByCode: vi.fn().mockResolvedValue(null),
            findSummaryByServiceId: vi.fn(),
            findPointsByServiceId: vi.fn(),
        } as unknown as ComparisonsRepository;
        const service = new ComparisonsService(mockRepo, mockServiceRepo);

        await expect(
            service.compare({
                range: '24h',
                selections: [
                    {
                        selectionId: 'a',
                        externalId: 'service-a',
                        simulatedRegionCode: 'inexistente',
                    },
                    { selectionId: 'b', externalId: 'service-b', simulatedRegionCode: null },
                ],
            }),
        ).rejects.toThrow('Região inexistente não foi encontrada');
        expect(mockRepo.findRegionByCode).toHaveBeenCalledWith('inexistente');
        expect(mockRepo.findSummaryByServiceId).not.toHaveBeenCalled();
        expect(mockRepo.findPointsByServiceId).not.toHaveBeenCalled();
    });
});
