export interface RegionCardRow {
    id: string;
    codigo: string;
    pais: string;
    regiao: string;
    cidade: string | null;
    latitude: number | null;
    longitude: number | null;
    carbon_intensity: number;
    renewable_share_percent: number;
    atualizado_em: Date;
    total_services: number;
    listed_services: number;
    unlisted_services: number;
    available_services: number;
    metrics_missing_services: number;
    unavailable_services: number;
}

export interface RegionTotalsRow {
    regiao_id: string;
    sample_count: number;
    energy_kwh: number | null;
    co2e_grams: number | null;
}

export interface ServiceCountsDto {
    totalServices: number;
    listedServices: number;
    availableServices: number;
    metricsMissingServices: number;
    unavailableServices: number;
    unlistedServices: number;
}

export interface PeriodSummaryDto {
    sampleCount: number;
    energyKwh: number | null;
    co2eGrams: number | null;
    basis: 'sum_of_stored_samples';
}

export interface RegionCardDto {
    code: string;
    country: string;
    region: string;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
    carbonIntensityGco2ePerKwh: number;
    renewableSharePercent: number;
    carbonFactorUpdatedAt: string;
    serviceCounts: ServiceCountsDto;
    periodSummary: PeriodSummaryDto | null;
}

export interface RegionsResponseDto {
    generatedAt: string;
    period: { from: string; to: string } | null;
    regions: RegionCardDto[];
}
