const formatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 });
export function metricValue(value: number | null, unit: string) {
    return value === null ? 'Sem amostras' : `${formatter.format(value)} ${unit}`;
}

export const ranges = ['1h', '6h', '24h', '7d', '30d'] as const;
