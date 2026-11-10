import type { ServiceStatus } from '../types/service';

export interface StatusMeta {
    label: string;
    tone: 'good' | 'warning' | 'critical' | 'neutral';
    icon: string;
}

export const STATUS_META: Record<ServiceStatus, StatusMeta> = {
    available: { label: 'Ativo', tone: 'good', icon: '●' },
    metrics_missing: { label: 'Sem métricas', tone: 'warning', icon: '◐' },
    unavailable: { label: 'Indisponível', tone: 'critical', icon: '✕' },
    removed: { label: 'Removido', tone: 'neutral', icon: '−' },
    unknown: { label: 'Desconhecido', tone: 'neutral', icon: '?' },
};

export function statusMeta(status: string): StatusMeta {
    return STATUS_META[status as ServiceStatus] ?? STATUS_META.unknown;
}
