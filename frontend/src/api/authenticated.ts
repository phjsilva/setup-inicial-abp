import { API_URL, ApiError } from '@/api/client';

interface Options {
    token?: string;
    method?: 'POST' | 'PATCH';
    body?: unknown;
    signal?: AbortSignal;
}

export async function request(path: string, options: Options = {}) {
    const { token, method, body, signal } = options;
    const headers = new Headers();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    if (body !== undefined) headers.set('Content-Type', 'application/json');
    const response = await fetch(`${API_URL}/api/v1${path}`, {
        method,
        headers,
        signal,
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!response.ok) {
        if (response.status === 401 && token) {
            window.dispatchEvent(new CustomEvent('greener:expired-session', { detail: token }));
        }
        const data = (await response.json().catch(() => null)) as {
            error?: { message?: string; details?: { message: string }[] };
        } | null;
        throw new ApiError(
            data?.error?.details?.[0]?.message ??
                data?.error?.message ??
                `Falha na comunicação (HTTP ${response.status}).`,
            response.status,
        );
    }
    return response;
}

export async function requestJson<T>(path: string, options?: Options): Promise<T> {
    const response = await request(path, options);
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
}

export function errorMessage(error: unknown) {
    return error instanceof Error ? error.message : 'Não foi possível concluir a operação.';
}
