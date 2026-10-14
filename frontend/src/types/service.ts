export type ServiceStatus = 'available' | 'metrics_missing' | 'unavailable';

export interface ServiceLocation {
  regionCode: string;
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
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
  renewableSharePercent: number;
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