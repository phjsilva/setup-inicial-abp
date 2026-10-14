import { useEffect, useState } from 'react';
import { fetchServices, poll } from '@/api/services';
import type { ServiceSummary } from '@/types/service';

interface State {
  key: string;
  services: ServiceSummary[];
  error: string | null;
  updatedAt: string | null;
}
export function useServices(regionCode?: string, active?: boolean) {
  const key = JSON.stringify([regionCode, active]);
  const [state, setState] = useState<State | null>(null);
  useEffect(
    () =>
      poll(
        (signal) => fetchServices({ regionCode, active }, signal),
        (data) =>
          setState({
            key,
            services: data.services,
            error: null,
            updatedAt: new Date().toISOString(),
          }),
        (error) =>
          setState((previous) => ({
            key,
            services: previous?.key === key ? previous.services : [],
            error,
            updatedAt: previous?.key === key ? previous.updatedAt : null,
          })),
      ),
    [regionCode, active, key],
  );
  const current = state?.key === key ? state : null;
  return {
    services: current?.services ?? [],
    isLoading: current === null,
    error: current?.error ?? null,
    updatedAt: current?.updatedAt ?? null,
  };
}
