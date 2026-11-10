import type { HistoryRange } from '@/types/service';

export interface Metrics {
    samples: number;
    energy: number | null;
    carbon: number | null;
    cpu: number | null;
    memory: number | null;
    power: number | null;
}

export interface MetricService extends Metrics {
    id: string;
    name: string;
    status: 'available' | 'metrics_missing' | 'unavailable';
    active: boolean;
    collectedAt: string | null;
    regionCode: string;
    region: string;
    intensity: number;
}

export interface Snapshot {
    range: HistoryRange;
    start: string;
    end: string;
    services: MetricService[];
    points: (Metrics & { time: string })[];
}
