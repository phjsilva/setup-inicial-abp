import type { HistoryRange } from '@/types/service';

export interface ComparisonRequest {
    range: HistoryRange;
    selections: ComparisonSelection[];
}

export interface ComparisonSelection {
    selectionId: string;
    externalId: string;
    simulatedRegionCode: string | null;
}

export interface ComparisonResponse {
    range: HistoryRange;
    period: {
        from: string;
        to: string;
    };
    series: ComparisonSeries[];
}

export interface ComparisonSeries {
    selectionId: string;

    summary: ComparisonSummary;
    points: ComparisonPoint[];
}

export interface ComparisonSummary {
    sampleCount: number;
    energyKwh: number | null;
    co2eGrams: number | null;
}

export interface ComparisonPoint {
    timestamp: string;
    sampleCount: number;
    energyKwh: number | null;
    co2eGrams: number | null;
}
