export interface ServiceRow {
    id: string;
    external_id: string;
    nome: string;
    ativo: boolean;
    status: string;
    ultima_vez_visto_em: Date;
    codigo: string | null;
    pais: string | null;
    regiao: string | null;
    cidade: string | null;
    latitude: number | null;
    longitude: number | null;
    carbon_intensity: number | null;
}

export interface CollectionRow {
    coletado_em: Date;
    intervalo_metrica_segundos: number;
    cpu_percent: number;
    memory_gb: number;
    disk_gb: number;
    network_gb: number;
    potencia_estimada_w: number;
    energia_estimada_kwh: number;
    carbon_intensity: number;
    co2e_estimado_g: number;
}

export interface LocationDto {
    regionCode: string;
    country: string;
    region: string;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
    currentCarbonIntensityGco2ePerKwh: number;
}
export interface ServiceDto {
    id: string;
    name: string;
    active: boolean;
    status: string;
    lastSeenAt: string;
    location: LocationDto | null;
}

export interface EstimatesDto {
    powerWatts: number;
    energyKwh: number;
    co2eGrams: number;
    carbonIntensityGco2ePerKwh: number;
}

export interface MetricsDto {
    cpuPercent: number;
    memoryGb: number;
    diskGb: number;
    networkGb: number;
}

export interface LatestCollectionDto {
    collectedAt: string;
    collectionIntervalSeconds: number;
    metrics: MetricsDto;
    estimates: EstimatesDto;
}

export interface ServiceOverviewDto {
    service: ServiceDto;
    latestCollection: LatestCollectionDto | null;
}
