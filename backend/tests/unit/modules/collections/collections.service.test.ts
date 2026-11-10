import { describe, it, expect, vi } from 'vitest';
import { CollectionsService } from '../../../../src/modules/collections/collections.service.js';
import type { CollectionsRepository } from '../../../../src/modules/collections/collections.repository.js';
import type { CarbonClient } from '../../../../src/integrations/carbon-api.js';
import type { MetricsClient } from '../../../../src/integrations/metrics-api.js';
import type {
    ActiveService,
    EstimateParameter,
} from '../../../../src/modules/collections/types/collections.types.js';
import { ExternalApiError } from '../../../../src/shared/errors/external-api-error.js';
import type { MetricsResponse } from '../../../../src/integrations/metrics-api.schema.js';

describe('Processamento de métricas em coletas (CollectionsService)', () => {
    it('deve processar valores diferentes retornados entre coletas consecutivas', async () => {
        const mockParams: EstimateParameter = {
            id: 'param-1',
            cpu_max_watts: 200,
            ram_watts_per_gb: 3,
            disk_watts_per_gb: 1,
            network_watts_per_gb: 2,
            active: true,
        };

        const mockServices: ActiveService[] = [
            {
                id: 'service-1',
                external_id: 'service-api',
                metrics_path: '/metrics',
                carbon_intensity: 150,
            },
        ];

        const mockRepo = {
            findActiveEstimateParameter: vi.fn().mockResolvedValue(mockParams),
            findActiveServices: vi.fn().mockResolvedValue(mockServices),
            createCollection: vi.fn().mockResolvedValue({
                id: 'collection-1',
                coletado_em: new Date(),
            }),
            createStatusCollection: vi.fn().mockResolvedValue(undefined),
            updateStatus: vi.fn().mockResolvedValue(true),
        } as unknown as CollectionsRepository;

        const mockCarbonClient = {} as CarbonClient;

        const mockMetricsClient = {
            getMetrics: vi.fn(),
        } as unknown as MetricsClient;

        const service = new CollectionsService(mockRepo, mockCarbonClient, mockMetricsClient);

        // Inicia coleta
        const firstMetrics: MetricsResponse = {
            collection_interval_seconds: 60,
            metrics: {
                cpu_percent: 20,
                memory_gb: 4,
                disk_gb: 10,
                network_gb: 1,
            },
        };
        vi.mocked(mockMetricsClient.getMetrics).mockResolvedValueOnce(firstMetrics);

        const firstResult = await service.runCollectionRound();
        expect(firstResult).toBe(1);
        expect(mockRepo.createCollection).toHaveBeenCalledTimes(1);
        expect(mockRepo.createCollection).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                service_id: 'service-1',
                cpu_percent: 20,
                memory_gb: 4,
                disk_gb: 10,
                network_gb: 1,
            }),
        );

        const secondMetrics: MetricsResponse = {
            collection_interval_seconds: 60,
            metrics: {
                cpu_percent: 80,
                memory_gb: 8,
                disk_gb: 15,
                network_gb: 5,
            },
        };
        vi.mocked(mockMetricsClient.getMetrics).mockResolvedValueOnce(secondMetrics);

        const secondResult = await service.runCollectionRound();
        expect(secondResult).toBe(1);
        expect(mockRepo.createCollection).toHaveBeenCalledTimes(2);
        expect(mockRepo.createCollection).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                service_id: 'service-1',
                cpu_percent: 80,
                memory_gb: 8,
                disk_gb: 15,
                network_gb: 5,
            }),
        );

        // Compara os dados entre as coletas
        const firstCall = vi.mocked(mockRepo.createCollection).mock.calls[0][0];
        const secondCall = vi.mocked(mockRepo.createCollection).mock.calls[1][0];

        expect(secondCall.cpu_percent).not.toBe(firstCall.cpu_percent);
        expect(secondCall.memory_gb).not.toBe(firstCall.memory_gb);
        expect(secondCall.estimated_power_w).toBeGreaterThan(firstCall.estimated_power_w);
        expect(secondCall.estimated_co2e_g).toBeGreaterThan(firstCall.estimated_co2e_g);
    });
    it('deve registrar falha na coleta e registrar sucesso quando o serviço voltar a responder', async () => {
        const mockParams: EstimateParameter = {
            id: 'param-1',
            cpu_max_watts: 200,
            ram_watts_per_gb: 3,
            disk_watts_per_gb: 1,
            network_watts_per_gb: 2,
            active: true,
        };
        const mockServices: ActiveService[] = [
            {
                id: 'service-1',
                external_id: 'service-api',
                metrics_path: '/metrics',
                carbon_intensity: 150,
            },
        ];
        const mockRepo = {
            findActiveEstimateParameter: vi.fn().mockResolvedValue(mockParams),
            findActiveServices: vi.fn().mockResolvedValue(mockServices),
            createCollection: vi.fn().mockResolvedValue({
                id: 'collection-1',
                coletado_em: new Date(),
            }),
            createStatusCollection: vi.fn().mockResolvedValue(undefined),
            updateStatus: vi.fn().mockResolvedValue(true),
        } as unknown as CollectionsRepository;
        const mockCarbonClient = {} as CarbonClient;
        const mockMetricsClient = {
            getMetrics: vi.fn(),
        } as unknown as MetricsClient;
        const service = new CollectionsService(mockRepo, mockCarbonClient, mockMetricsClient);
        const error = new ExternalApiError('Tempo de resposta esgotado', 'timeout');
        const metrics: MetricsResponse = {
            collection_interval_seconds: 60,
            metrics: { cpu_percent: 20, memory_gb: 4, disk_gb: 10, network_gb: 1 },
        };
        vi.mocked(mockMetricsClient.getMetrics)
            .mockRejectedValueOnce(error)
            .mockResolvedValueOnce(metrics);
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

        try {
            // Primeira tentativa: a API não responde e nenhuma coleta deve ser salva.
            expect(await service.runCollectionRound()).toBe(0);
            expect(mockRepo.createCollection).not.toHaveBeenCalled();
            expect(mockRepo.createStatusCollection).toHaveBeenNthCalledWith(1, {
                service_id: 'service-1',
                descricao: 'Tempo de resposta esgotado',
                http_status: null,
                tipo: 'timeout',
            });
            expect(mockRepo.updateStatus).toHaveBeenNthCalledWith(1, 'service-1', 'unavailable');

            // Segunda tentativa: a API volta e o sucesso fica vinculado à coleta.
            expect(await service.runCollectionRound()).toBe(1);
            expect(mockMetricsClient.getMetrics).toHaveBeenCalledTimes(2);
            expect(mockMetricsClient.getMetrics).toHaveBeenNthCalledWith(1, '/metrics');
            expect(mockMetricsClient.getMetrics).toHaveBeenNthCalledWith(2, '/metrics');
            expect(mockRepo.createCollection).toHaveBeenCalledTimes(1);
            expect(mockRepo.createCollection).toHaveBeenCalledWith(
                expect.objectContaining({
                    service_id: 'service-1',
                    cpu_percent: 20,
                    memory_gb: 4,
                }),
            );
            expect(mockRepo.createStatusCollection).toHaveBeenCalledTimes(2);
            expect(mockRepo.createStatusCollection).toHaveBeenNthCalledWith(2, {
                service_id: 'service-1',
                coleta_id: 'collection-1',
                descricao: 'Métricas coletadas e salvas com sucesso.',
                http_status: null,
                tipo: 'success',
            });
            expect(mockRepo.updateStatus).toHaveBeenCalledTimes(2);
            expect(mockRepo.updateStatus).toHaveBeenNthCalledWith(2, 'service-1', 'available');
        } finally {
            consoleError.mockRestore();
        }
    });

    it('deve retornar zero quando não houver serviços ativos', async () => {
        const mockParams: EstimateParameter = {
            id: 'param-1',
            cpu_max_watts: 200,
            ram_watts_per_gb: 3,
            disk_watts_per_gb: 1,
            network_watts_per_gb: 2,
            active: true,
        };
        const mockRepo = {
            findActiveEstimateParameter: vi.fn().mockResolvedValue(mockParams),
            findActiveServices: vi.fn().mockResolvedValue([]),
            createCollection: vi.fn(),
            createStatusCollection: vi.fn(),
        } as unknown as CollectionsRepository;
        const mockMetricsClient = { getMetrics: vi.fn() } as unknown as MetricsClient;
        const service = new CollectionsService(mockRepo, {} as CarbonClient, mockMetricsClient);

        expect(await service.runCollectionRound()).toBe(0);
        expect(mockRepo.findActiveServices).toHaveBeenCalledTimes(1);
        expect(mockMetricsClient.getMetrics).not.toHaveBeenCalled();
        expect(mockRepo.createCollection).not.toHaveBeenCalled();
        expect(mockRepo.createStatusCollection).not.toHaveBeenCalled();
    });

    it('deve informar erro quando não houver parâmetro de estimativa ativo', async () => {
        const mockRepo = {
            findActiveEstimateParameter: vi.fn().mockResolvedValue(null),
            findActiveServices: vi.fn().mockResolvedValue([]),
            createCollection: vi.fn(),
        } as unknown as CollectionsRepository;
        const mockMetricsClient = { getMetrics: vi.fn() } as unknown as MetricsClient;
        const service = new CollectionsService(mockRepo, {} as CarbonClient, mockMetricsClient);

        await expect(service.runCollectionRound()).rejects.toThrow(
            'Nenhum parâmetro de estimativa ativo',
        );
        expect(mockMetricsClient.getMetrics).not.toHaveBeenCalled();
        expect(mockRepo.createCollection).not.toHaveBeenCalled();
    });

    it('deve continuar a coleta dos outros serviços quando um deles falhar', async () => {
        const mockParams: EstimateParameter = {
            id: 'param-1',
            cpu_max_watts: 200,
            ram_watts_per_gb: 3,
            disk_watts_per_gb: 1,
            network_watts_per_gb: 2,
            active: true,
        };
        const mockServices: ActiveService[] = [
            {
                id: '1',
                external_id: 'service-a',
                metrics_path: '/metrics/a',
                carbon_intensity: 150,
            },
            {
                id: '2',
                external_id: 'service-b',
                metrics_path: '/metrics/b',
                carbon_intensity: 150,
            },
        ];
        const mockRepo = {
            findActiveEstimateParameter: vi.fn().mockResolvedValue(mockParams),
            findActiveServices: vi.fn().mockResolvedValue(mockServices),
            createCollection: vi
                .fn()
                .mockResolvedValue({ id: 'collection-2', coletado_em: new Date() }),
            createStatusCollection: vi.fn().mockResolvedValue(undefined),
            updateStatus: vi.fn().mockResolvedValue(true),
        } as unknown as CollectionsRepository;
        const metrics: MetricsResponse = {
            collection_interval_seconds: 60,
            metrics: { cpu_percent: 20, memory_gb: 4, disk_gb: 10, network_gb: 1 },
        };
        const mockMetricsClient = {
            getMetrics: vi
                .fn()
                .mockRejectedValueOnce(new ExternalApiError('Tempo esgotado', 'timeout'))
                .mockResolvedValueOnce(metrics),
        } as unknown as MetricsClient;
        const service = new CollectionsService(mockRepo, {} as CarbonClient, mockMetricsClient);
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

        try {
            expect(await service.runCollectionRound()).toBe(1);
            expect(mockMetricsClient.getMetrics).toHaveBeenCalledTimes(2);
            expect(mockMetricsClient.getMetrics).toHaveBeenCalledWith('/metrics/a');
            expect(mockMetricsClient.getMetrics).toHaveBeenCalledWith('/metrics/b');
            expect(mockRepo.createCollection).toHaveBeenCalledTimes(1);
            expect(mockRepo.createCollection).toHaveBeenCalledWith(
                expect.objectContaining({ service_id: '2' }),
            );
            expect(mockRepo.createStatusCollection).toHaveBeenCalledTimes(2);
            expect(mockRepo.createStatusCollection).toHaveBeenCalledWith(
                expect.objectContaining({ service_id: '1', tipo: 'timeout' }),
            );
            expect(mockRepo.createStatusCollection).toHaveBeenCalledWith(
                expect.objectContaining({
                    service_id: '2',
                    tipo: 'success',
                    coleta_id: 'collection-2',
                }),
            );
            expect(mockRepo.updateStatus).toHaveBeenCalledWith('1', 'unavailable');
            expect(mockRepo.updateStatus).toHaveBeenCalledWith('2', 'available');
        } finally {
            consoleError.mockRestore();
        }
    });
});
