export interface Region {
    code: string;
    country: string;
    region: string;
    city?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    carbon_intensity_gco2e_per_kwh: number;
    renewable_share_percent: number;
}

export interface ServiceLocation {
    region_code: string;
    country: string;
    region: string;
    city?: string | null;
    latitude?: number | null;
    longitude?: number | null;
}

export interface Service {
    id: string;
    name: string;
    location: ServiceLocation;
    metrics_path: string;
}

export interface Collection {
    service_id: string;
    estimate_parameter_id: string;
    collected_at?: Date;
    metric_interval_seconds: number;
    cpu_percent: number;
    memory_gb: number;
    disk_gb: number;
    network_gb: number;
    cpu_watts: number;
    memory_watts: number;
    disk_watts: number;
    network_watts: number;
    estimated_power_w: number;
    estimated_energy_kwh: number;
    carbon_intensity: number;
    estimated_co2e_g: number;
}

export interface EstimateParameter {
    id: string;
    cpu_max_watts: number;
    ram_watts_per_gb: number;
    disk_watts_per_gb: number;
    network_watts_per_gb: number;
    active: boolean;
}

export interface RegionEnergyInfo {
    carbon_intensity: number;
    renewable_share_percent: number;
}

export interface ActiveService {
    id: string;
    external_id: string;
    metrics_path: string;
    carbon_intensity: number;
}

export type ServiceStatus = 'available' | 'metrics_missing' | 'unavailable';

export type ProcessedMetrics = {
    cpuPercent: number;
    memoryGb: number;
    diskGb: number;
    networkGb: number;
    collectionIntervalSeconds: number;
    collectionIntervalHours: number;
};

export type Emissions = {
    cpuWatts: number;
    memoryWatts: number;
    diskWatts: number;
    networkWatts: number;
    powerW: number;
    energyKwh: number;
    co2eG: number;
};
