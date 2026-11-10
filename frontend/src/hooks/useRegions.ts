import { useCallback } from 'react';

import { fetchRegions } from '@/api/regions';
import { useApiQuery } from '@/hooks/useApiQuery';

export function useRegions() {
    const fetcher = useCallback(() => fetchRegions(), []);

    const { data, error, isLoading } = useApiQuery(fetcher);

    return {
        regions: data ?? [],
        isLoading,
        error,
    };
}
