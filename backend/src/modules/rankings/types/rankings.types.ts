import type { RankingsQuery } from '../rankings.schema.js';

export interface RankingRow {
    external_id: string;
    nome: string;
    region_code: string;
    city: string | null;
    energy_kwh: number | null;
    co2e_grams: number | null;
    sample_count: number;
}

export interface RankingItemDto {
    position: number | null;
    externalId: string;
    name: string;
    region: {
        code: string;
        city: string | null;
    };
    energyKwh: number | null;
    co2eGrams: number | null;
    sampleCount: number;
}

export interface RankingsResponseDto {
    criterion: RankingsQuery['criterion'];
    range: RankingsQuery['range'];
    period: {
        from: string;
        to: string;
    };
    items: RankingItemDto[];
}
