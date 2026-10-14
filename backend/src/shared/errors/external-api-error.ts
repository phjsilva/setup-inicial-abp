export type ExternalApiErrorKind = 'timeout' | 'unavailable' | 'bad_status' | 'invalid_response';

export class ExternalApiError extends Error {
    readonly status?: number;

    constructor(
        message: string,
        readonly kind: ExternalApiErrorKind,
        options?: { cause?: unknown; status?: number },
    ) {
        super(message, { cause: options?.cause });
        this.name = 'ExternalApiError';
        this.status = options?.status;
    }
}
