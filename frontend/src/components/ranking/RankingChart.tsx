import { Link } from 'react-router';
import { formatRankingValue } from '@/components/ranking/formatRankingValue';
import { ChartCard } from '@/components/charts/ChartCard';
import type { RankingCriterion, RankingItem } from '@/types/ranking';

interface RankingChartProps {
    criterion: RankingCriterion;
    items: RankingItem[];
}

const titles: Record<RankingCriterion, string> = {
    co2eGrams: 'Emissão por serviço',
    energyKwh: 'Consumo de energia por serviço',
};

export function RankingChart({ criterion, items }: RankingChartProps) {
    // Serviços sem dados no período ficam só na tabela.
    const bars = items.filter((item) => item[criterion] !== null);
    const maxValue = Math.max(0, ...bars.map((item) => item[criterion] ?? 0));

    return (
        <section aria-label="Gráfico do ranking">
            <ChartCard title={titles[criterion]} subtitle="Clique numa barra para ver o serviço.">
                {bars.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Nenhum serviço com coletas no período.
                    </p>
                ) : (
                    <ol className="space-y-2">
                        {bars.map((item) => {
                            const value = item[criterion] ?? 0;
                            const widthPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;

                            return (
                                <li key={item.externalId}>
                                    <Link
                                        to={`/servicos/${item.externalId}`}
                                        aria-label={`Ver ${item.name}: ${formatRankingValue(criterion, item[criterion])}`}
                                        className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 rounded-lg px-3 py-2 text-sm transition-colors duration-200 hover:bg-white/5 sm:grid-cols-[minmax(6rem,8rem)_minmax(0,1fr)_minmax(8rem,auto)] sm:gap-y-0"
                                    >
                                        <span className="col-start-1 row-start-1 min-w-0 truncate font-medium text-foreground/80 transition-colors group-hover:text-foreground sm:font-normal sm:text-muted-foreground">
                                            {item.name}
                                        </span>

                                        <span className="col-start-2 row-start-1 whitespace-nowrap text-right text-xs font-semibold tabular-nums text-foreground/80 sm:col-start-3 sm:text-sm">
                                            {formatRankingValue(criterion, item[criterion])}
                                        </span>

                                        <div className="col-span-2 col-start-1 row-start-2 h-2.5 overflow-hidden rounded-full bg-secondary/70 ring-1 ring-white/5 sm:col-span-1 sm:col-start-2 sm:row-start-1">
                                            <div
                                                className="h-full rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.25)] transition-[width,background-color] duration-500 ease-out group-hover:bg-emerald-200"
                                                style={{ width: `${widthPercent}%` }}
                                            />
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ol>
                )}
            </ChartCard>
        </section>
    );
}
