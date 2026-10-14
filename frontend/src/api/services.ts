import type {
    ServiceLocation,
    ServiceMetrics,
    ServiceStatus,
    ServiceSummary,
} from '@/types/service';

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');
export const REFRESH_MS = 5_000;
export type Range = '1h' | '6h' | '24h' | '7d' | '30d';
export interface Collection {
    collectedAt: string;
    collectionIntervalSeconds: number;
    metrics: ServiceMetrics;
    estimates: {
        powerWatts: number;
        energyKwh: number;
        co2eGrams: number;
        carbonIntensityGco2ePerKwh: number;
    };
}
export interface ApiService {
    id: string;
    name: string;
    active: boolean;
    status: ServiceStatus;
    statusUpdatedAt: string;
    lastSeenAt: string;
    location: (ServiceLocation & { currentCarbonIntensityGco2ePerKwh?: number }) | null;
}
export interface Overview {
    service: ApiService;
    latestCollection: Collection | null;
}
export interface Analytics {
    serviceId: string;
    range: Range;
    period: { from: string; to: string };
    summary: { sampleCount: number; energyKwh: number | null; co2eGrams: number | null };
    points: {
        timestamp: string;
        cpuPercent: number;
        memoryGb: number;
        powerWatts: number;
        co2ePerCollectionGrams: number;
    }[];
}
export interface Monitoring {
    serverTime: string;
    collectionIntervalSeconds: number;
    lastSuccessfulCollectionAt: string | null;
    nextCollectionAt: string | null;
    running: boolean;
    dependencies: { metricsDiscovery: string; carbon: string; database: string };
}
export async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
    const response = await fetch(`${API_URL}/api/v1${path}`, {
        signal,
        headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
            body?.error?.message ?? `Falha ao consultar a API (HTTP ${response.status})`,
        );
    }
    return response.json();
}
export async function fetchServices(
    filters: { regionCode?: string; active?: boolean } = {},
    signal?: AbortSignal,
): Promise<ServiceSummary[]> {
    const query = new URLSearchParams();
    if (filters.regionCode !== undefined) query.set('regionCode', filters.regionCode);
    if (filters.active !== undefined) query.set('active', String(filters.active));
    const data = await request<{
        services: (ApiService & { latestCollection: Collection | null })[];
    }>(`/services?${query}`, signal);
    return data.services.map(({ latestCollection, ...service }) => ({
        ...service,
        location: service.location ?? {
            regionCode: '—',
            country: '—',
            region: '—',
            city: null,
            latitude: null,
            longitude: null,
        },
        metrics: latestCollection?.metrics ?? null,
        environmental: latestCollection
            ? {
                  ...latestCollection.estimates,
                  carbonIntensity: latestCollection.estimates.carbonIntensityGco2ePerKwh,
                  renewableSharePercent: null,
              }
            : null,
    }));
}
export const fetchOverview = (id: string, signal?: AbortSignal) =>
    request<Overview>(`/services/${encodeURIComponent(id)}`, signal);
export const fetchAnalytics = (id: string, range: Range, signal?: AbortSignal) =>
    request<Analytics>(
        `/services/${encodeURIComponent(id)}/collections?range=${range}&maxPoints=120`,
        signal,
    );
