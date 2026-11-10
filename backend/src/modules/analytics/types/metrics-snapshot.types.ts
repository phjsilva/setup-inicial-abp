import type { SnapshotRange } from '../metrics-snapshot.schema.js';

interface Metrics {
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
    collectedAt: Date | null;
    regionCode: string;
    region: string;
    intensity: number;
}

export interface MetricPoint extends Metrics {
    time: Date;
}

export interface MetricsSnapshot {
    range: SnapshotRange;
    start: Date;
    end: Date;
    services: MetricService[];
    points: MetricPoint[];
}
