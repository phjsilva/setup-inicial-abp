import { useEffect, useState } from 'react';
import { fetchMonitoringStatus } from '@/api/monitoring';
import type { MonitoringStatus } from '@/types/monitoring';

// Folga depois do horário previsto da coleta (ex.: coleta em 30 s → consulta em 31 s).
const MARGIN_MS = 1000;
// Sem previsão de coleta ou com a API fora do ar, tenta de novo depois deste tempo.
const RETRY_MS = 30_000;

export interface MonitoringState {
    status: MonitoringStatus | null;
    // Horários convertidos para o relógio do navegador.
    nextCollectionAt: number | null;
    lastCollectionAt: number | null;
    error: string | null;
}

// Consulta o estado do monitoramento e agenda a próxima consulta para logo depois
// da próxima coleta do backend, nunca antes de 1 s.
export function useMonitoringStatus() {
    const [state, setState] = useState<MonitoringState>({
        status: null,
        nextCollectionAt: null,
        lastCollectionAt: null,
        error: null,
    });

    useEffect(() => {
        let cancelled = false;
        let timer: ReturnType<typeof setTimeout> | undefined;

        const schedule = (delay: number) => {
            if (!cancelled) timer = setTimeout(load, Math.max(MARGIN_MS, delay));
        };

        const load = () => {
            fetchMonitoringStatus()
                .then((status) => {
                    if (cancelled) return;
                    // Diferença entre o relógio do servidor e o do navegador.
                    const offset = Date.parse(status.serverTime) - Date.now();
                    const nextCollectionAt = status.nextCollectionAt
                        ? Date.parse(status.nextCollectionAt) - offset
                        : null;
                    const lastCollectionAt = status.lastSuccessfulCollectionAt
                        ? Date.parse(status.lastSuccessfulCollectionAt) - offset
                        : null;
                    setState({ status, nextCollectionAt, lastCollectionAt, error: null });

                    if (nextCollectionAt !== null) {
                        schedule(nextCollectionAt - Date.now() + MARGIN_MS);
                    } else if (status.running) {
                        // Rodada em andamento: confere de novo em 1 s até ela terminar.
                        schedule(MARGIN_MS);
                    } else {
                        schedule(RETRY_MS);
                    }
                })
                .catch((err: unknown) => {
                    if (cancelled) return;
                    setState((previous) => ({
                        ...previous,
                        error: err instanceof Error ? err.message : 'Erro ao comunicar com a API.',
                    }));
                    schedule(RETRY_MS);
                });
        };

        load();

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, []);

    return state;
}
