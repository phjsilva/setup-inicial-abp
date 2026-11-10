export interface DiscoveredServiceLocation {
    regionCode: string;
    country: string;
    region: string;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
}

export interface DiscoveredService {
    id: string;
    name: string;
    metricsPath: string;
    location: DiscoveredServiceLocation;
}
