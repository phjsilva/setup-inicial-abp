import type { ServiceStatus } from '@/types/service';

// O ícone repete a informação da cor, para o estado não depender só dela.
export const statusInfo: Record<
    ServiceStatus,
    { label: string; icon: string; description: string; className: string }
> = {
    available: {
        label: 'Disponível',
        icon: '●',
        description: 'A última coleta do serviço foi bem-sucedida.',
        className: 'bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/40',
    },
    metrics_missing: {
        label: 'Sem métricas',
        icon: '◐',
        description: 'O serviço foi encontrado, mas não trouxe métricas válidas.',
        className: 'bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/40',
    },
    unavailable: {
        label: 'Indisponível',
        icon: '✕',
        description: 'Não foi possível coletar as métricas do serviço.',
        className: 'bg-red-400/15 text-red-300 ring-1 ring-red-400/40',
    },
    removed: {
        label: 'Removido',
        icon: '−',
        description: 'Serviço não aparece mais na descoberta.',
        className: 'bg-slate-400/15 text-slate-300 ring-1 ring-slate-400/40',
    },
    unknown: {
        label: 'Desconhecido',
        icon: '?',
        description: 'Estado recebido não é reconhecido pela interface.',
        className: 'bg-slate-400/15 text-slate-300 ring-1 ring-slate-400/40',
    },
};
