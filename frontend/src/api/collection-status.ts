import { getJson } from './services';

export type CollectionResult = 'success' | 'failure' | 'pending';

export interface CollectionStatusItem {
    externalId: string;
    name: string;
    location: { regionCode: string; city: string | null; country: string };
    lastSuccessfulCollectionAt: string | null;
    result: CollectionResult;
    latestAttempt: {
        observedAt: string;
        type: string;
        description: string;
        httpStatus: number | null;
    } | null;
}

export interface CollectionStatusResponse {
    summary: {
        totalServices: number;
        successfulServices: number;
        failedServices: number;
        pendingServices: number;
    };
    items: CollectionStatusItem[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface CollectionStatusQuery {
    search: string;
    result: CollectionResult | 'all';
    page: number;
    limit: number;
}

export function fetchCollectionStatuses(query: CollectionStatusQuery) {
    const params = new URLSearchParams({ page: String(query.page), limit: String(query.limit) });
    if (query.search) params.set('search', query.search);
    if (query.result !== 'all') params.set('result', query.result);
    return getJson<CollectionStatusResponse>(`/collections/status?${params}`);
}

export interface CollectionStatusHistoryItem {
    id: string;
    observedAt: string;
    result: 'success' | 'failure';
    type: string;
    description: string;
    httpStatus: number | null;
}

export interface CollectionStatusHistoryResponse {
    externalId: string;
    items: CollectionStatusHistoryItem[];
}

export function fetchCollectionStatusHistory(externalId: string) {
    return getJson<CollectionStatusHistoryResponse>(
        `/services/${encodeURIComponent(externalId)}/collection-status`,
    );
}
