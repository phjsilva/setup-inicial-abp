export interface CollectionPointRow {
    timestamp: Date;
    sample_count: number;
    cpu_percent: number;
    memory_gb: number;
    power_watts: number;
    co2e_per_collection_grams: number;
    energy_kwh: number;
    co2e_grams: number;
}

export interface SumaryRow {
    sample_count: number;
    energy_kwh: number | null;
    co2e_grams: number | null;
}

export interface CollectionsAnalyticsDto {
    generatedAt: string;
    serviceId: string;
    range: '1h' | '6h' | '24h' | '7d' | '30d';
    period: {
        from: string;
        to: string;
    };
    maxPoints: number;
    bucketSeconds: number;
    summary: {
        sampleCount: number;
        energyKwh: number | null;
        co2eGrams: number | null;
    };
    points: {
        timestamp: string;
        sampleCount: number;
        cpuPercent: number;
        memoryGb: number;
        powerWatts: number;
        co2ePerCollectionGrams: number;
        energyKwh: number;
        co2eGrams: number;
    }[];
}
