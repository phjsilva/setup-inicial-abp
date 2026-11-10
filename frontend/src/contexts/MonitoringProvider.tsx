import { useState, type ReactNode } from 'react';
import { MonitoringContext } from '@/contexts/monitoring';
import { useMonitoringStatus } from '@/hooks/useMonitoringStatus';

// Uma única consulta a /monitoring/status para a aplicação inteira.
export function MonitoringProvider({ children }: { children: ReactNode }) {
    const monitoring = useMonitoringStatus();

    // undefined = estado ainda não carregado; a primeira resposta não dispara recarga,
    // porque as páginas acabaram de buscar os dados ao abrir.
    const finishedAt = monitoring.status ? monitoring.status.lastRoundFinishedAt : undefined;
    const [round, setRound] = useState({ finishedAt, refreshKey: 0 });
    const [screenUpdatedAt, setScreenUpdatedAt] = useState<number | null>(null);
    if (round.finishedAt !== finishedAt) {
        const newRound = round.finishedAt !== undefined && finishedAt != null;
        setRound({ finishedAt, refreshKey: round.refreshKey + (newRound ? 1 : 0) });
    }

    return (
        <MonitoringContext.Provider
            value={{
                ...monitoring,
                refreshKey: round.refreshKey,
                screenUpdatedAt,
                markScreenUpdated: setScreenUpdatedAt,
            }}
        >
            {children}
        </MonitoringContext.Provider>
    );
}
