export type ServiceStatus = 'available' | 'unavailable' | 'metrics_missing' | 'removed' | 'unknown';

export interface ServiceLocation {
    regionCode: string;
    country: string;
    region: string;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
}

export interface ServiceMetrics {
    cpuPercent: number;
    memoryGb: number;
    diskGb: number;
    networkGb: number;
}

export interface ServiceEnvironmental {
    powerWatts: number;
    energyKwh: number;
    co2eGrams: number;
    carbonIntensity: number;
    renewableSharePercent: number | null;
}

export interface ServiceDetail {
    active?: boolean;
    statusUpdatedAt?: string;
    collectedAt?: string;
    collectionIntervalSeconds?: number;
    id: string;
    name: string;
    status: ServiceStatus;
    lastSeenAt: string;
    location: ServiceLocation | null;
    metrics: ServiceMetrics | null;
    environmental: ServiceEnvironmental | null;
}

export type ServiceSummary = ServiceDetail;

// Formato devolvido pelo backend (GET /api/v1/services e GET /api/v1/services/:id).
export interface ServiceLocationDto extends ServiceLocation {
    currentCarbonIntensityGco2ePerKwh: number | null;
}

export interface LatestCollection {
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

export interface ServiceDto {
    id: string;
    name: string;
    active: boolean;
    status: string;
    statusUpdatedAt: string;
    lastSeenAt: string;
    location: ServiceLocationDto | null;
}

export interface ServiceOverview {
    service: Omit<ServiceDto, 'status'> & { status: ServiceStatus };
    latestCollection: LatestCollection | null;
}

export interface ServicesListResponse {
    generatedAt: string;
    services: (ServiceDto & { latestCollection: LatestCollection | null })[];
}

// Histórico agrupado (GET /api/v1/services/:id/collections).
export type HistoryRange = '1h' | '6h' | '24h' | '7d' | '30d';

export interface HistoryPoint {
    timestamp: string;
    cpuPercent: number;
    memoryGb: number;
    powerWatts: number;
    co2ePerCollectionGrams: number;
    energyKwh: number;
    co2eGrams: number;
}

export interface ServiceHistory {
    range: HistoryRange;
    period: { from: string; to: string };
    summary: {
        sampleCount: number;
        energyKwh: number | null;
        co2eGrams: number | null;
    };
    points: HistoryPoint[];
}
