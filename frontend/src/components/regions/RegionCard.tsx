import type { Region } from '@/types/api';
import { formatCo2e, formatEnergy, formatIntensity } from '@/utils/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RegionCardProps {
    region: Region;
}

function regionTitle(region: Region): string {
    return region.city ?? region.region ?? region.code;
}

function RegionMetric({
    label,
    value,
    align = 'left',
}: {
    label: string;
    value: string;
    align?: 'left' | 'right';
}) {
    return (
        <div className={align === 'right' ? 'text-right' : undefined}>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 font-semibold tabular-nums text-white">{value}</p>
        </div>
    );
}

export function RegionCard({ region }: RegionCardProps) {
    const renewableShare =
        region.renewableSharePercent == null
            ? '—'
            : `${region.renewableSharePercent.toLocaleString('pt-BR', {
                  maximumFractionDigits: 1,
              })}%`;

    return (
        <Card className="h-full bg-white/5 text-left text-white ring-white/10 transition-colors hover:bg-white/10">
            <CardHeader className="pb-0">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <CardTitle className="min-w-0 text-lg">{regionTitle(region)}</CardTitle>

                    <span className="shrink-0 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-medium text-white/60">
                        {region.code}
                    </span>
                </div>

                <p className="text-sm text-white/60">
                    {[region.region, region.country].filter(Boolean).join(', ')}
                </p>
            </CardHeader>

            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-5 pt-4">
                {/* Intensidade e renováveis. */}
                <RegionMetric label="Intensidade" value={formatIntensity(region.gco2ePerKwh)} />

                <RegionMetric label="Renováveis" value={renewableShare} align="right" />

                {/* Energia e emissões nas últimas 24 horas. */}
                <RegionMetric label="Energia · 24h" value={formatEnergy(region.energyKwh)} />

                <RegionMetric
                    label="Emissões · 24h"
                    value={formatCo2e(region.co2eGrams)}
                    align="right"
                />

                {/* Quantidade de serviços. */}
                <div className="col-span-2 border-t border-white/10 pt-3">
                    <RegionMetric label="Serviços" value={String(region.servicesCount)} />

                    {region.statusCounts.metricsMissing > 0 && (
                        <p className="mt-1 text-xs text-amber-300">
                            {region.statusCounts.metricsMissing} sem métricas
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
