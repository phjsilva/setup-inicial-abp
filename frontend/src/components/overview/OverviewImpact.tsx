import { useState } from 'react';
import { TimeSeriesChart } from '@/components/charts/TimeSeriesChart';
import { formatDateTime } from '@/lib/format';
import { metricValue } from '@/lib/metric-format';
import type { Snapshot } from '@/types/metrics';

const metrics = {
    energy: { label: 'Energia estimada', unit: 'kWh', color: '#34d399' },
    carbon: { label: 'Emissões estimadas', unit: 'g CO₂e', color: '#67e8f9' },
} as const;

type ImpactMetric = keyof typeof metrics;

function total(snapshot: Snapshot | null, key: ImpactMetric) {
    const values = snapshot?.services.flatMap((service) => service[key] ?? []) ?? [];
    return values.length ? values.reduce((sum, value) => sum + value, 0) : null;
}

export function OverviewImpact({
    snapshot,
    unavailable,
}: {
    snapshot: Snapshot | null;
    unavailable: boolean;
}) {
    const [metric, setMetric] = useState<ImpactMetric>('energy');
    const { label, unit, color } = metrics[metric];
    const latest = snapshot?.services.reduce<string | null>((current, service) => {
        const collectedAt = service.collectedAt;
        return collectedAt && (!current || Date.parse(collectedAt) > Date.parse(current))
            ? collectedAt
            : current;
    }, null);
    const points =
        snapshot?.points.flatMap((point) =>
            point[metric] === null ? [] : [{ time: point.time, value: point[metric] }],
        ) ?? [];

    return (
        <section
            className="min-w-0 rounded-2xl border border-emerald-400/25 bg-[#101827] p-4 sm:p-6 lg:p-8"
            aria-labelledby="overview-impact"
        >
            <header className="mb-5 flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1">
                <h2
                    id="overview-impact"
                    className="text-xl font-semibold tracking-tight sm:text-2xl"
                >
                    Impacto no período
                </h2>
                <p className="text-sm text-muted-foreground">
                    {latest ? (
                        <>
                            Última coleta{' '}
                            <time dateTime={latest} className="font-medium text-foreground">
                                {formatDateTime(latest)}
                            </time>
                        </>
                    ) : snapshot ? (
                        'Sem coletas no período'
                    ) : unavailable ? (
                        'Coleta indisponível'
                    ) : (
                        'Buscando coletas…'
                    )}
                </p>
            </header>

            <div
                className="grid grid-cols-2 gap-2 sm:max-w-lg sm:gap-3"
                role="group"
                aria-label="Métrica do gráfico"
            >
                {(['energy', 'carbon'] as const).map((key) => {
                    const info = metrics[key];
                    const value = total(snapshot, key);
                    return (
                        <button
                            key={key}
                            type="button"
                            aria-pressed={key === metric}
                            onClick={() => setMetric(key)}
                            className="flex min-w-0 flex-col items-start rounded-lg border border-white/10 px-3 py-2.5 text-left hover:bg-white/5 aria-pressed:border-current aria-pressed:bg-white/5 sm:px-4"
                            style={{ color: info.color }}
                        >
                            <span className="block text-xs text-muted-foreground sm:text-sm">
                                {info.label}
                            </span>
                            <strong className="block text-base font-semibold break-words tabular-nums min-[360px]:text-lg sm:text-2xl">
                                {value === null ? '—' : metricValue(value, info.unit)}
                            </strong>
                        </button>
                    );
                })}
            </div>

            <div className="mt-4 min-w-0 border-t border-white/10 pt-4 sm:mt-6">
                {snapshot ? (
                    <TimeSeriesChart
                        data={points}
                        label={label + ' ao longo do tempo'}
                        color={color}
                        formatValue={(value) => metricValue(value, unit)}
                        responsive
                    />
                ) : (
                    <p role="status" className="py-6 text-sm text-muted-foreground">
                        {unavailable
                            ? 'Não foi possível carregar as métricas deste período.'
                            : 'Carregando métricas do período…'}
                    </p>
                )}
            </div>
        </section>
    );
}
