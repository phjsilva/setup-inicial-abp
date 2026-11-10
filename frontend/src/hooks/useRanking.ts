import { useCallback } from 'react';
import { fetchRanking } from '@/api/rankings';
import { useApiQuery } from '@/hooks/useApiQuery';
import type { RankingCriterion } from '@/types/ranking';
import type { HistoryRange } from '@/types/service';

export function useRanking(criterion: RankingCriterion, range: HistoryRange) {
    const fetcher = useCallback(() => fetchRanking(criterion, range), [criterion, range]);
    return useApiQuery(fetcher);
}
