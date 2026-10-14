import type { ServiceDetail } from '@/types/service';

export interface ServiceHistoryPoint {
    collectedAt: string;
    cpuPercent: number;
    memoryGb: number;
    powerWatts: number;
    co2eGrams: number;
}

const POINTS = 24;
const HOUR_MS = 60 * 60 * 1000;

function round(value: number, digits = 2): number {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
}

// Gera 24 coletas de exemplo (uma por hora) que terminam nos valores atuais do serviço.
export function buildServiceHistory(service: ServiceDetail): ServiceHistoryPoint[] {
    const { metrics, environmental } = service;

    if (!metrics || !environmental) {
        return [];
    }

    const end = new Date(service.lastSeenAt).getTime();

    return Array.from({ length: POINTS }, (_, index) => {
        const step = index - (POINTS - 1);
        const wave = Math.sin(step / 3) * 0.15 + (Math.cos(step / 5) - 1) * 0.08;
        const factor = 1 + wave;

        return {
            collectedAt: new Date(end + step * HOUR_MS).toISOString(),
            cpuPercent: round(Math.min(100, metrics.cpuPercent * factor)),
            memoryGb: round(metrics.memoryGb * (1 + wave / 3)),
            powerWatts: round(environmental.powerWatts * factor),
            co2eGrams: round(environmental.co2eGrams * factor, 3),
        };
    });
}