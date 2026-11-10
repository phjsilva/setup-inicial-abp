// src/metrics-api/metrics.client.ts
import type { ZodType } from 'zod';
import { ExternalApiError, externalHttpError } from '../shared/errors/external-api-error.js';
import {
    type MetricsResponse,
    metricsResponseSchema,
    servicesResponseSchema,
    type MetricsService,
    metricsServiceSchema,
} from './metrics-api.schema.js';

export class MetricsClient {
    constructor(
        private readonly baseUrl: string,
        private readonly timeoutMs = 8_000,
    ) {}

    getServices(): Promise<MetricsService[]> {
        return this.request('/services', servicesResponseSchema);
    }

    getServiceById(id: string): Promise<MetricsService> {
        return this.request(`/services/${encodeURIComponent(id)}`, metricsServiceSchema);
    }

    getMetrics(metricsPath: string): Promise<MetricsResponse> {
        return this.request(metricsPath, metricsResponseSchema, true);
    }

    private async request<T>(
        path: string,
        schema: ZodType<T>,
        isMetricsRequest = false,
    ): Promise<T> {
        let response: Response;
        const signal = AbortSignal.timeout(this.timeoutMs);
        try {
            response = await fetch(`${this.baseUrl}${path}`, {
                signal,
            });
        } catch (err) {
            const isTimeout = err instanceof Error && err.name === 'TimeoutError';
            throw new ExternalApiError(
                isTimeout
                    ? 'A coleta não foi concluída porque a plataforma de métricas demorou demais para responder.'
                    : 'Não foi possível conectar à plataforma de métricas para realizar a coleta.',
                isTimeout ? 'timeout' : 'unavailable',
                { cause: err },
            );
        }
        if (!response.ok) {
            throw externalHttpError(response.status, isMetricsRequest);
        }

        let json: unknown;

        try {
            json = await response.json();
        } catch (err) {
            if (signal.aborted) {
                throw new ExternalApiError(
                    'A coleta não foi concluída porque o recebimento dos dados demorou demais.',
                    'timeout',
                    { cause: err },
                );
            }

            throw new ExternalApiError(
                'A coleta recebeu dados que não puderam ser interpretados.',
                'invalid_response',
                {
                    cause: err,
                },
            );
        }

        const parsed = schema.safeParse(json);
        if (!parsed.success) {
            throw new ExternalApiError(
                'A coleta recebeu dados incompletos ou em um formato inesperado.',
                'invalid_response',
                {
                    cause: parsed.error,
                },
            );
        }
        return parsed.data;
    }
}
