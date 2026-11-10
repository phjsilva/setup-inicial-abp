import type { Region } from '@/types/api';
import { formatIntensity } from '@/utils/format';

interface CarbonIntensityChartProps {
    regions: Region[];
}

const BAR_COLORS = [
    '#60A5FA',
    '#34D399',
    '#22D3EE',
    '#A78BFA',
    '#F472B6',
    '#818CF8',
    '#2DD4BF',
    '#93C5FD',
    '#6EE7B7',
    '#C4B5FD',
    '#38BDF8',
    '#FB7185',
];

function regionName(region: Region): string {
    return region.city ?? region.region ?? region.code;
}

export function CarbonIntensityChart({ regions }: CarbonIntensityChartProps) {
    const rows = regions
        .filter(
            (region): region is Region & { gco2ePerKwh: number } =>
                region.gco2ePerKwh != null && Number.isFinite(region.gco2ePerKwh),
        )
        .toSorted((a, b) => b.gco2ePerKwh - a.gco2ePerKwh);

    if (rows.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">Sem dados de intensidade de carbono.</p>
        );
    }

    const maxValue = Math.max(...rows.map((region) => region.gco2ePerKwh));

    return (
        <div
            className="mb-2 mt-4 space-y-2"
            role="list"
            aria-label="Intensidade de carbono por região"
        >
            {rows.map((region, index) => {
                const value = region.gco2ePerKwh;
                const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
                const color = BAR_COLORS[index % BAR_COLORS.length];

                return (
                    <div
                        key={region.code}
                        role="listitem"
                        className="group rounded-lg px-3 py-2 transition-colors duration-200 hover:bg-white/5"
                    >
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 sm:grid-cols-[minmax(6rem,8rem)_minmax(0,1fr)_minmax(8rem,auto)] sm:gap-y-0">
                            {/* Nome da região. */}
                            <span
                                className="col-start-1 row-start-1 min-w-0 truncate text-sm font-medium text-foreground sm:font-normal sm:text-muted-foreground"
                                title={regionName(region)}
                            >
                                {regionName(region)}
                            </span>

                            {/* Valor da intensidade. */}
                            <span className="col-start-2 row-start-1 whitespace-nowrap text-right text-xs font-semibold tabular-nums text-foreground/80 sm:col-start-3 sm:text-sm">
                                {formatIntensity(value)}
                            </span>

                            {/* Barra proporcional. */}
                            <div
                                className="col-span-2 col-start-1 row-start-2 h-2.5 overflow-hidden rounded-full bg-secondary/70 ring-1 ring-white/5 sm:col-span-1 sm:col-start-2 sm:row-start-1"
                                role="meter"
                                aria-label={`Intensidade de carbono de ${regionName(region)}`}
                                aria-valuemin={0}
                                aria-valuemax={maxValue}
                                aria-valuenow={value}
                            >
                                <div
                                    className="h-full rounded-full transition-[width] duration-500 ease-out"
                                    style={{
                                        width: `${percentage}%`,
                                        backgroundColor: color,
                                        boxShadow: `0 0 10px ${color}55`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
