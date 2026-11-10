import type { HistoryRange } from '@/types/service';

export type RankingCriterion = 'co2eGrams' | 'energyKwh';

// Espelha a resposta de GET /api/v1/rankings (docs/API.md).
export interface RankingItem {
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

export interface RankingResponse {
    criterion: RankingCriterion;
    range: HistoryRange;
    period: {
        from: string;
        to: string;
    };
    items: RankingItem[];
}
