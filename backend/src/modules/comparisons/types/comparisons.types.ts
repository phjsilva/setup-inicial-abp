import type { CreateComparisonInput } from '../comparisons.schema.js';

export interface CollectionSummaryRow {
    sample_count: number;
    energy_kwh: number | null;
    co2e_grams: number | null;
}

export interface RegionRow {
    codigo: string;
    carbon_intensity: number;
}

export interface CollectionPointRow extends CollectionSummaryRow {
    timestamp: Date;
}

export interface ComparisonSummaryDto {
    sampleCount: number;
    energyKwh: number | null;
    co2eGrams: number | null;
}

export interface ComparisonPointDto extends ComparisonSummaryDto {
    timestamp: string;
}

export interface ComparisonSeriesDto {
    selectionId: string;
    summary: ComparisonSummaryDto;
    points: ComparisonPointDto[];
}

export interface ComparisonResponseDto {
    range: CreateComparisonInput['range'];
    period: {
        from: string;
        to: string;
    };
    series: ComparisonSeriesDto[];
}
