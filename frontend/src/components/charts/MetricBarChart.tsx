import { metricValue } from '@/lib/metric-format';

interface MetricBarChartProps {
    data: { id: string; name: string; value: number | null }[];
    label: string;
    unit: string;
}

export function MetricBarChart({ data, label, unit }: MetricBarChartProps) {
    const max = Math.max(0, ...data.map((item) => item.value ?? 0));
    if (data.every((item) => item.value === null)) {
        return <p className="text-sm text-muted-foreground">Sem dados no período.</p>;
    }

    return (
        <ul className="grid gap-[0.8rem]" aria-label={label}>
            {data.map(({ id, name, value }) => (
                <li key={id}>
                    <div className="flex flex-wrap justify-between gap-x-[0.8rem] gap-y-[0.2rem] text-[0.83rem] [overflow-wrap:anywhere]">
                        <span>{name}</span>
                        <strong className="text-[#a7f3d0] tabular-nums">
                            {metricValue(value, unit)}
                        </strong>
                    </div>
                    {value !== null && (
                        <span
                            className="mt-[0.35rem] block h-[0.4rem] rounded-full bg-white/10"
                            aria-hidden="true"
                        >
                            <span
                                className="block h-full rounded-full bg-linear-to-r from-[#10b981] to-[#6ee7b7]"
                                style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
                            />
                        </span>
                    )}
                </li>
            ))}
        </ul>
    );
}
