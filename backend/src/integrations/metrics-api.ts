// src/metrics-api/metrics.client.ts
import type { ZodType } from 'zod';
import { ExternalApiError } from '../shared/errors/external-api-error.js';
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
        return this.request(metricsPath, metricsResponseSchema);
    }

    private async request<T>(path: string, schema: ZodType<T>): Promise<T> {
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
                    ? `Timeout de ${this.timeoutMs}ms em ${path}`
                    : `Metrics API indisponível em ${path}`,
                isTimeout ? 'timeout' : 'unavailable',
                { cause: err },
            );
        }
        if (response.status === 530) {
            throw new ExternalApiError(
                'API auxiliar inacessível: resposta HTTP 530',
                'bad_status',
                { status: 530 },
            );
        }

        if (!response.ok) {
            throw new ExternalApiError(
                `Metrics API respondeu ${response.status} em ${path}`,
                'bad_status',
                { status: response.status },
            );
        }

        let json: unknown;

        try {
            json = await response.json();
        } catch (err) {
            if (signal.aborted) {
                throw new ExternalApiError(
                    `Timeout de ${this.timeoutMs}ms ao ler resposta de ${path}`,
                    'timeout',
                    { cause: err },
                );
            }

            throw new ExternalApiError(`JSON inválido em ${path}`, 'invalid_response', {
                cause: err,
            });
        }

        const parsed = schema.safeParse(json);
        if (!parsed.success) {
            throw new ExternalApiError(`Resposta fora do contrato em ${path}`, 'invalid_response', {
                cause: parsed.error,
            });
        }
        return parsed.data;
    }
}
