export function formatIntensity(value: number | null): string {
    if (value == null) return '—';
    return `${value.toLocaleString('pt-BR')} gCO₂e/kWh`;
}

export function formatEnergy(value: number | null): string {
    if (value == null) return '—';
    const magnitude = Math.abs(value);
    const [amount, unit] =
        magnitude === 0 || magnitude >= 1
            ? ([value, 'kWh'] as const)
            : magnitude >= 0.001
              ? ([value * 1000, 'Wh'] as const)
              : ([value * 1_000_000, 'mWh'] as const);
    return `${amount.toLocaleString('pt-BR', { maximumSignificantDigits: 4 })} ${unit}`;
}

export function formatCo2e(value: number | null): string {
    if (value == null) return '—';
    return `${value.toLocaleString('pt-BR')} gCO₂e`;
}
