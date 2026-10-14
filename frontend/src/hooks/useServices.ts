import { useEffect, useState } from 'react';
import { fetchServices, REFRESH_MS } from '@/api/services';
import type { ServiceSummary } from '@/types/service';

export function useServices(regionCode?: string, active?: boolean) {
    const [services, setServices] = useState<ServiceSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        let controller: AbortController;
        async function load() {
            controller?.abort();
            controller = new AbortController();
            const currentController = controller;
            try {
                const data = await fetchServices({ regionCode, active }, currentController.signal);
                if (!cancelled) {
                    setServices(data);
                    setError(null);
                }
            } catch (err) {
                if (!cancelled && !currentController.signal.aborted)
                    setError(err instanceof Error ? err.message : 'Erro ao carregar os serviços.');
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }
        void load();
        const timer = setInterval(load, REFRESH_MS);
        return () => {
            cancelled = true;
            controller?.abort();
            clearInterval(timer);
        };
    }, [regionCode, active]);
    return { services, isLoading, error };
}
