import type { ReportMetric } from '@/types/report';

export const reportMetrics: Record<ReportMetric, { label: string; unit: string }> = {
    energy: { label: 'Energia estimada', unit: 'kWh' },
    carbon: { label: 'Emissões estimadas', unit: 'g CO₂e' },
    cpu: { label: 'CPU média', unit: '%' },
    memory: { label: 'Memória média', unit: 'GB' },
    power: { label: 'Potência média', unit: 'W' },
};
