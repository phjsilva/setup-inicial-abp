export interface Region {
    code: string;
    country: string | null;
    region: string | null;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
    gco2ePerKwh: number | null;
    renewableSharePercent: number | null;
    carbonSource?: string | null;
    servicesCount: number;
    energyKwh: number | null;
    co2eGrams: number | null;
    statusCounts: { available: number; unavailable: number; metricsMissing: number };
}
