import { requestJson } from '@/api/authenticated';
import type { Account, Session } from '@/types/account';

export function fetchProfile(token: string, signal?: AbortSignal) {
    return requestJson<Account>('/profile', { token, signal });
}
export function updateProfile(
    body: { name: string; email: string; currentPassword?: string },
    token: string,
) {
    return requestJson<Session>('/profile', { token, method: 'PATCH', body });
}
export function authenticate(
    body: { email: string; password: string; name?: string },
    signup: boolean,
) {
    return requestJson<Session>(signup ? '/auth/register' : '/auth/login', {
        method: 'POST',
        body,
    });
}
export function requestPasswordReset(email: string) {
    return requestJson<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: { email },
    });
}
export function resetPassword(token: string | null, password: string) {
    return requestJson<void>('/auth/reset-password', { method: 'POST', body: { token, password } });
}
