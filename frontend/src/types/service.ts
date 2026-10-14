export type ServiceStatus = 'available' | 'metrics_missing' | 'unavailable';

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
    id: string;
    name: string;
    status: ServiceStatus;
    lastSeenAt: string;
    location: ServiceLocation;
    metrics: ServiceMetrics | null;
    environmental: ServiceEnvironmental | null;
}

export interface ServiceSummary {
    active?: boolean;
    id: string;
    name: string;
    status: ServiceStatus;
    lastSeenAt: string;
    location: ServiceLocation;
    metrics: ServiceMetrics | null;
    environmental: ServiceEnvironmental | null;
}
