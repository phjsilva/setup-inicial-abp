import { getJson } from '@/api/services';
import type { RankingCriterion, RankingResponse } from '@/types/ranking';
import type { HistoryRange } from '@/types/service';

export function fetchRanking(criterion: RankingCriterion, range: HistoryRange) {
    const params = new URLSearchParams({ criterion, range });

    return getJson<RankingResponse>(`/rankings?${params}`);
}
