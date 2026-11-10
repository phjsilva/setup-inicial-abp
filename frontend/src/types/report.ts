import type { Snapshot } from '@/types/metrics';
import type { HistoryRange } from '@/types/service';

export type ReportMetric = 'energy' | 'carbon' | 'cpu' | 'memory' | 'power';
export type Visualization = 'line' | 'bars' | 'table';

export interface ReportFilters {
    title?: string;
    serviceIds: string[];
    range: HistoryRange;
    metrics: ReportMetric[];
    visualization: Visualization;
    end?: string;
}

export interface Report extends Snapshot {
    title: string;
    metrics: ReportMetric[];
    visualization: Visualization;
}
