import { useCallback } from 'react';
import { fetchServiceHistory, fetchServiceOverview } from '@/api/services';
import { useApiQuery } from '@/hooks/useApiQuery';
import type { HistoryRange } from '@/types/service';

export function useServiceOverview(id: string) {
    const fetcher = useCallback(() => fetchServiceOverview(id), [id]);
    return useApiQuery(fetcher);
}

export function useServiceHistory(id: string, range: HistoryRange) {
    const fetcher = useCallback(() => fetchServiceHistory(id, range), [id, range]);
    return useApiQuery(fetcher);
}
