export type ExternalApiErrorKind =
    | 'timeout'
    | 'unavailable'
    | 'service_missing'
    | 'metrics_missing'
    | 'bad_status'
    | 'cloudflare_error'
    | 'invalid_response';

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

const collectionErrors: Readonly<Record<number, string>> = {
    429: 'A coleta não foi realizada porque o limite de consultas foi atingido.',
    502: 'A coleta não foi realizada por uma falha de comunicação com a plataforma de métricas.',
    503: 'A coleta não foi realizada porque a plataforma de métricas está temporariamente indisponível.',
    504: 'A coleta não foi concluída porque a plataforma de métricas demorou demais para responder.',
    530: 'A coleta não foi realizada por uma falha de acesso à plataforma externa (Cloudflare).',
};

export function externalHttpError(status: number, isMetricsRequest = false): ExternalApiError {
    let message =
        collectionErrors[status] ?? 'A consulta à plataforma externa não pôde ser concluída.';
    let kind: ExternalApiErrorKind = status === 530 ? 'cloudflare_error' : 'bad_status';
    if (isMetricsRequest && status === 404) {
        kind = 'service_missing';
        message = 'Não foi possível coletar: o serviço foi removido ou suas métricas não existem.';
    } else if (isMetricsRequest && status === 500) {
        kind = 'metrics_missing';
        message =
            'Não foi possível coletar: o serviço ou o componente que fornece suas métricas está indisponível.';
    }
    return new ExternalApiError(message, kind, { status });
}
