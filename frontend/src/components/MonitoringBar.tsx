import { useEffect, useState } from 'react';
import { request, REFRESH_MS, type Monitoring } from '@/api/services';
import { formatDateTime } from '@/lib/format';
export function MonitoringBar() {
    const [data, setData] = useState<Monitoring | null>(null);
    const [connected, setConnected] = useState(false);
    const [updatedAt, setUpdatedAt] = useState<string | null>(null);
    const [clock, setClock] = useState(() => ({ now: Date.now(), serverOffset: 0 }));
    useEffect(() => {
        const timer = setInterval(() => {
            setClock((previous) => ({ ...previous, now: Date.now() }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);
    useEffect(() => {
        let cancelled = false;
        const controller = new AbortController();
        async function load() {
            try {
                const status = await request<Monitoring>('/monitoring/status', controller.signal);
                if (!cancelled) {
                    const now = Date.now();
                    setData(status);
                    setConnected(true);
                    setUpdatedAt(new Date(now).toISOString());
                    setClock({ now, serverOffset: new Date(status.serverTime).getTime() - now });
                }
            } catch {
                if (!cancelled) setConnected(false);
            }
        }
        void load();
        const timer = setInterval(load, REFRESH_MS);
        return () => {
            cancelled = true;
            controller.abort();
            clearInterval(timer);
        };
    }, []);
    const remainingSeconds = data?.nextCollectionAt
        ? Math.max(
              0,
              Math.ceil(
                  (new Date(data.nextCollectionAt).getTime() - clock.now - clock.serverOffset) /
                      1000,
              ),
          )
        : null;
    const nextCollection = !connected
        ? 'Sem conexão'
        : data?.running
          ? 'Em andamento'
          : remainingSeconds === null
            ? 'Sem agendamento'
            : remainingSeconds === 0
              ? 'Aguardando coleta'
              : `em ${remainingSeconds} s`;
    return (
        <div className="border-b border-border bg-background/40 px-4 py-2 sm:px-6">
            <div className="mx-auto max-w-7xl space-y-2 text-xs text-muted-foreground">
                <span
                    className={`inline-flex items-center gap-2 rounded-full border px-2 py-1 ${connected ? 'border-primary/30 text-primary' : 'border-destructive/30 text-destructive'}`}
                >
                    <span className="size-1.5 rounded-full bg-current" />
                    {connected ? 'Conectado à API' : 'API desconectada'}
                </span>
                <div className="flex flex-wrap gap-x-5 gap-y-1">
                    <span>Última coleta: {formatDateTime(data?.lastSuccessfulCollectionAt)}</span>
                    <span className="tabular-nums" title={formatDateTime(data?.nextCollectionAt)}>
                        Próxima coleta: {nextCollection}
                    </span>
                    <span>Intervalo de coleta: {data?.collectionIntervalSeconds ?? '—'} s</span>
                    <span>Atualização da tela: {REFRESH_MS / 1000} s</span>
                    <span>Tela atualizada: {formatDateTime(updatedAt)}</span>
                    <span>
                        Métricas:{' '}
                        {data?.dependencies.metricsDiscovery === 'available'
                            ? 'Disponíveis'
                            : data?.dependencies.metricsDiscovery === 'unavailable'
                              ? 'Indisponíveis'
                              : 'Sem confirmação'}{' '}
                        · Carbono:{' '}
                        {data?.dependencies.carbon === 'available'
                            ? 'Disponível'
                            : data?.dependencies.carbon === 'unavailable'
                              ? 'Indisponível'
                              : 'Sem confirmação'}
                    </span>
                </div>
            </div>
        </div>
    );
}
