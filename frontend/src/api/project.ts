import { requestJson } from '@/api/authenticated';
import type { Coefficients, CollectionSettings, EstimatePreview, Member } from '@/types/project';

export function fetchCollectionSettings(token: string, signal?: AbortSignal) {
    return requestJson<CollectionSettings>('/project/collection', { token, signal });
}
export function updateCollectionInterval(intervalSeconds: number, token: string) {
    return requestJson<{ intervalSeconds: number }>('/project/collection', {
        token,
        method: 'PATCH',
        body: { intervalSeconds },
    });
}
export function fetchCoefficients(token: string, signal?: AbortSignal) {
    return requestJson<Coefficients | null>('/project/coefficients', { token, signal });
}
export function previewCoefficients(body: Omit<Coefficients, 'id'>, token: string) {
    return requestJson<EstimatePreview>('/project/coefficients/preview', {
        token,
        method: 'POST',
        body,
    });
}
export function activateCoefficients(body: Omit<Coefficients, 'id'>, token: string) {
    return requestJson<Coefficients>('/project/coefficients', { token, method: 'POST', body });
}
export function fetchMembers(token: string, search = '', signal?: AbortSignal) {
    return requestJson<Member[]>('/project/members?' + new URLSearchParams({ search }), {
        token,
        signal,
    });
}
export function updateMember(id: string, body: Pick<Member, 'role' | 'active'>, token: string) {
    return requestJson<Member>('/project/members/' + encodeURIComponent(id), {
        token,
        method: 'PATCH',
        body,
    });
}
