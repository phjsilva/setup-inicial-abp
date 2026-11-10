import { useCallback } from 'react';
import { fetchServices } from '@/api/services';
import { useApiQuery } from '@/hooks/useApiQuery';

// Os filtros de região e de listagem (ativo / não listado) vão como query para o backend.
export function useServices(regionCode?: string, active?: boolean) {
    const fetcher = useCallback(() => fetchServices({ regionCode, active }), [regionCode, active]);
    const { data, error, isLoading } = useApiQuery(fetcher);

    return { services: data ?? [], isLoading, error };
}
