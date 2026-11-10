import type { HistoryRange } from '@/types/service';

export type WidgetId =
    | 'energy'
    | 'carbon'
    | 'trend'
    | 'carbon-trend'
    | 'cpu-trend'
    | 'memory-trend'
    | 'power-trend'
    | 'energy-by-service'
    | 'power'
    | 'cpu'
    | 'memory'
    | 'status'
    | 'collections'
    | 'availability'
    | 'ranking'
    | 'regions'
    | 'comparison';

export interface DashboardDraft {
    name: string;
    range: HistoryRange;
    widgets: WidgetId[];
}

export interface Dashboard extends DashboardDraft {
    id: string;
}
