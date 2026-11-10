// src/carbon-api/carbon.client.ts
import type { ZodType } from 'zod';
import { ExternalApiError } from '../shared/errors/external-api-error.js';
import { type RegionsResponse, regionsResponseSchema } from './carbon-api.schema.js';

export class CarbonClient {
    constructor(
        private readonly baseUrl: string,
        private readonly timeoutMs = 8_000,
    ) {}

    getRegions(): Promise<RegionsResponse> {
        return this.request('/regions', regionsResponseSchema);
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
                    : `Carbon API indisponível em ${path}`,
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
                `Carbon API respondeu ${response.status} em ${path}`,
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
