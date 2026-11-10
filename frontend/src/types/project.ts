import type { Account } from '@/types/account';

export interface CollectionSettings {
    intervalSeconds: number;
    effectiveIntervalSeconds: number;
    lastRoundAt: string | null;
    nextRoundAt: string | null;
}

export interface Coefficients {
    id: string;
    cpuMaxWatts: number;
    ramWattsPerGb: number;
    diskWattsPerGb: number;
    networkWattsPerGb: number;
}

export interface Member extends Account {
    active: boolean;
}

type Estimate = Record<
    'cpuWatts' | 'memoryWatts' | 'diskWatts' | 'networkWatts' | 'powerW' | 'energyKwh' | 'co2eG',
    number
>;
export interface EstimatePreview {
    example: {
        cpuPercent: number;
        memoryGb: number;
        diskGb: number;
        networkGb: number;
        collectionIntervalHours: number;
        carbonIntensity: number;
    };
    current: Estimate | null;
    proposed: Estimate;
}
