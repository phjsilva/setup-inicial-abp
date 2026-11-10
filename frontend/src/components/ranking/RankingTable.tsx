import { formatCo2e, formatEnergy } from '@/components/ranking/formatRankingValue';
import { ChartCard } from '@/components/charts/ChartCard';
import type { RankingCriterion, RankingItem } from '@/types/ranking';

interface RankingTableProps {
    criterion: RankingCriterion;
    items: RankingItem[];
}

const rankingColumns: {
    label: string;
    criterion?: RankingCriterion;
    className?: string;
}[] = [
    { label: '#' },
    { label: 'Serviço' },
    { label: 'Região', className: 'hidden sm:table-cell' },
    { label: 'Energia', criterion: 'energyKwh' },
    { label: 'CO₂e', criterion: 'co2eGrams' },
    { label: 'Coletas' },
];

const sortLabels: Record<RankingCriterion, string> = {
    co2eGrams: 'emissão de CO₂e',
    energyKwh: 'consumo de energia',
};

function valueClass(isSorted: boolean) {
    return `whitespace-nowrap px-4 py-3.5 tabular-nums ${
        isSorted ? 'font-semibold text-emerald-300' : 'text-muted-foreground'
    }`;
}

export function RankingTable({ criterion, items }: RankingTableProps) {
    return (
        <section aria-label="Tabela de classificação">
            <ChartCard
                title="Classificação"
                subtitle={`Totais somados no período considerado, ordenados por ${sortLabels[criterion]}, do maior para o menor.`}
            >
                <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-lg text-sm sm:min-w-xl">
                            <thead className="bg-white/[0.035]">
                                <tr>
                                    {rankingColumns.map((column) => {
                                        const isSorted = column.criterion === criterion;

                                        return (
                                            <th
                                                key={column.label}
                                                scope="col"
                                                aria-sort={isSorted ? 'descending' : undefined}
                                                className={`whitespace-nowrap border-b border-white/10 px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground ${
                                                    column.className ?? ''
                                                } ${isSorted ? 'text-emerald-300' : ''}`}
                                            >
                                                {column.label}
                                                {isSorted && (
                                                    <span className="ml-1.5 inline-block size-1.5 rounded-full bg-emerald-400 align-middle" />
                                                )}
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>

                            <tbody>
                                {items.map((item) => {
                                    // Sem coletas no período o backend devolve position null e métricas null.
                                    const hasData = item.sampleCount > 0;

                                    return (
                                        <tr
                                            key={item.externalId}
                                            className={`group transition-colors duration-150 hover:bg-white/[0.045] ${
                                                !hasData ? 'opacity-60' : ''
                                            }`}
                                        >
                                            {/* Posição. */}
                                            <td className="border-b border-white/[0.06] px-4 py-3.5 tabular-nums last:border-b-0">
                                                <span
                                                    className={`inline-flex size-7 items-center justify-center rounded-md border text-xs font-semibold ${
                                                        hasData
                                                            ? 'border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300'
                                                            : 'border-white/10 bg-white/[0.03] text-muted-foreground'
                                                    }`}
                                                >
                                                    {item.position ?? '—'}
                                                </span>
                                            </td>

                                            {/* Serviço. */}
                                            <td className="border-b border-white/[0.06] px-4 py-3.5 last:border-b-0">
                                                <span className="font-medium text-foreground transition-colors group-hover:text-emerald-200">
                                                    {item.name}
                                                </span>

                                                <span className="mt-1 block text-xs text-muted-foreground sm:hidden">
                                                    {item.region.code}
                                                </span>

                                                {!hasData && (
                                                    <span className="mt-1.5 inline-block whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-muted-foreground sm:ml-2 sm:mt-0">
                                                        Sem dados no período
                                                    </span>
                                                )}
                                            </td>

                                            {/* Região. */}
                                            <td className="hidden border-b border-white/[0.06] px-4 py-3.5 text-muted-foreground last:border-b-0 sm:table-cell">
                                                <span className="rounded-md border border-white/[0.07] bg-white/[0.025] px-2 py-1 text-xs">
                                                    {item.region.code}
                                                </span>
                                            </td>

                                            {/* Energia. */}
                                            <td
                                                className={`${valueClass(criterion === 'energyKwh')} border-b border-white/[0.06] last:border-b-0`}
                                            >
                                                {formatEnergy(item.energyKwh)}
                                            </td>

                                            {/* Emissões. */}
                                            <td
                                                className={`${valueClass(criterion === 'co2eGrams')} border-b border-white/[0.06] last:border-b-0`}
                                            >
                                                {formatCo2e(item.co2eGrams)}
                                            </td>

                                            {/* Coletas. */}
                                            <td className="border-b border-white/[0.06] px-4 py-3.5 tabular-nums text-muted-foreground last:border-b-0">
                                                {item.sampleCount.toLocaleString('pt-BR')}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </ChartCard>
        </section>
    );
}
