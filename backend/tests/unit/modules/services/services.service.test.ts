import { NotFoundError } from '../../../../src/shared/errors/NotFoundError.js';
import { describe, it, expect, vi } from 'vitest';
import { ServicesService } from '../../../../src/modules/services/services.service.js';
import type { ServiceRepository } from '../../../../src/modules/services/services.repository.js';
import type { ServiceWithLatestRow } from '../../../../src/modules/services/types/services.types.js';

describe('Consulta de serviços (ServicesService)', () => {
    it('deve consultar os serviços da região informada e retornar seus dados', async () => {
        const mockRows: ServiceWithLatestRow[] = [
            {
                id: '1',
                external_id: 'service-a',
                nome: 'Serviço A',
                ativo: true,
                status: 'available',
                status_atualizado_em: new Date('2026-11-06T12:00:00Z'),
                ultima_vez_visto_em: new Date('2026-11-06T12:00:00Z'),
                codigo: 'BR',
                pais: 'Brasil',
                regiao: 'Sudeste',
                cidade: 'São Paulo',
                latitude: null,
                longitude: null,
                carbon_intensity: 100,
                coletado_em: null,
                intervalo_metrica_segundos: null,
                cpu_percent: null,
                memory_gb: null,
                disk_gb: null,
                network_gb: null,
                potencia_estimada_w: null,
                energia_estimada_kwh: null,
                collection_carbon_intensity: null,
                co2e_estimado_g: null,
            },
        ];
        const mockRepo = {
            findAllWithLatest: vi.fn().mockResolvedValue(mockRows),
        } as unknown as ServiceRepository;
        const service = new ServicesService(mockRepo);

        const result = await service.list({ regionCode: 'BR', active: true });

        expect(mockRepo.findAllWithLatest).toHaveBeenCalledTimes(1);
        expect(mockRepo.findAllWithLatest).toHaveBeenCalledWith({ regionCode: 'BR', active: true });
        expect(result.filters).toEqual({ regionCode: 'BR', active: true });
        expect(result.services).toEqual([
            {
                id: 'service-a',
                name: 'Serviço A',
                active: true,
                status: 'available',
                statusUpdatedAt: '2026-11-06T12:00:00Z',
                lastSeenAt: '2026-11-06T12:00:00Z',
                location: {
                    regionCode: 'BR',
                    country: 'Brasil',
                    region: 'Sudeste',
                    city: 'São Paulo',
                    latitude: null,
                    longitude: null,
                    currentCarbonIntensityGco2ePerKwh: 100,
                },
                latestCollection: null,
            },
        ]);
    });

    it('deve retornar o histórico com sucesso e falha de um serviço', async () => {
        const observedAt = new Date('2026-11-06T12:00:00Z');
        const mockRepo = {
            findIdByExternalId: vi.fn().mockResolvedValue('1'),
            findCollectionStatusHistory: vi.fn().mockResolvedValue([
                {
                    id: 'status-1',
                    observado_em: observedAt,
                    tipo: 'success',
                    descricao: 'Coleta salva.',
                    http_status: null,
                },
                {
                    id: 'status-2',
                    observado_em: new Date('2026-11-06T11:00:00Z'),
                    tipo: 'timeout',
                    descricao: 'Tempo esgotado.',
                    http_status: null,
                },
            ]),
        } as unknown as ServiceRepository;
        const service = new ServicesService(mockRepo);

        const result = await service.getCollectionStatusHistory('service-a');

        expect(mockRepo.findIdByExternalId).toHaveBeenCalledWith('service-a');
        expect(mockRepo.findCollectionStatusHistory).toHaveBeenCalledWith('service-a');
        expect(result).toEqual({
            externalId: 'service-a',
            items: [
                {
                    id: 'status-1',
                    observedAt,
                    result: 'success',
                    type: 'success',
                    description: 'Coleta salva.',
                    httpStatus: null,
                },
                {
                    id: 'status-2',
                    observedAt: new Date('2026-11-06T11:00:00Z'),
                    result: 'failure',
                    type: 'timeout',
                    description: 'Tempo esgotado.',
                    httpStatus: null,
                },
            ],
        });
    });

    it('deve retornar histórico vazio para um serviço sem tentativas de coleta', async () => {
        const mockRepo = {
            findIdByExternalId: vi.fn().mockResolvedValue('1'),
            findCollectionStatusHistory: vi.fn().mockResolvedValue([]),
        } as unknown as ServiceRepository;
        const service = new ServicesService(mockRepo);

        const result = await service.getCollectionStatusHistory('service-a');

        expect(result).toEqual({ externalId: 'service-a', items: [] });
        expect(mockRepo.findCollectionStatusHistory).toHaveBeenCalledWith('service-a');
    });

    it('deve informar erro ao consultar o histórico de um serviço inexistente', async () => {
        const mockRepo = {
            findIdByExternalId: vi.fn().mockResolvedValue(null),
            findCollectionStatusHistory: vi.fn(),
        } as unknown as ServiceRepository;
        const service = new ServicesService(mockRepo);

        await expect(service.getCollectionStatusHistory('inexistente')).rejects.toThrow(
            NotFoundError,
        );
        await expect(service.getCollectionStatusHistory('inexistente')).rejects.toThrow(
            'Serviço inexistente não foi encontrado',
        );
        expect(mockRepo.findCollectionStatusHistory).not.toHaveBeenCalled();
    });
});
