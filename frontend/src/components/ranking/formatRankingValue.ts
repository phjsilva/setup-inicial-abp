import { formatNumber } from '@/lib/format';
import type { RankingCriterion } from '@/types/ranking';

// Energia abaixo de 1 kWh aparece em Wh, como no protótipo.
export function formatEnergy(kwh: number | null): string {
    if (kwh !== null && kwh < 1) {
        return formatNumber(kwh * 1000, 'Wh', 2);
    }

    return formatNumber(kwh, 'kWh', 2);
}

export function formatCo2e(grams: number | null): string {
    return formatNumber(grams, 'g CO₂e', 2);
}

export function formatRankingValue(criterion: RankingCriterion, value: number | null): string {
    return criterion === 'energyKwh' ? formatEnergy(value) : formatCo2e(value);
}
