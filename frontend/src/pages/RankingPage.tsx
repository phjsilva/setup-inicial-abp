import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { PageShell } from '@/components/shared/PageShell';
import { RankingChart } from '@/components/ranking/RankingChart';
import { RankingFilters } from '@/components/ranking/RankingFilters';
import { RankingTable } from '@/components/ranking/RankingTable';
import { formatDateTimeSeconds } from '@/lib/format';
import { useRanking } from '@/hooks/useRanking';
import type { RankingCriterion } from '@/types/ranking';
import type { HistoryRange } from '@/types/service';

export function RankingPage() {
    const [criterion, setCriterion] = useState<RankingCriterion>('co2eGrams');
    const [range, setRange] = useState<HistoryRange>('24h');
    // A requisição leva o critério e o período escolhidos. Gráfico e tabela usam o critério
    // devolvido pelo backend, para não misturar a ordem antiga com o destaque novo
    // enquanto a próxima resposta não chega.
    const { data: ranking, error, isLoading } = useRanking(criterion, range);

    return (
        <PageShell>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <PageHeader
                    title="Ranking de impacto"
                    description="Serviços ordenados por emissão ou consumo estimado no período escolhido."
                />

                <RankingFilters
                    criterion={criterion}
                    range={range}
                    onCriterionChange={setCriterion}
                    onRangeChange={setRange}
                />
            </div>

            {isLoading && <p className="text-muted-foreground">Carregando ranking...</p>}

            {error && (
                <p role="alert" className="text-destructive">
                    {ranking
                        ? `Não foi possível atualizar o ranking: ${error}. Exibindo os últimos dados recebidos.`
                        : `Não foi possível carregar o ranking: ${error}`}
                </p>
            )}

            {ranking && ranking.items.length === 0 && (
                <p className="text-muted-foreground">Nenhum serviço cadastrado para classificar.</p>
            )}

            {ranking && ranking.items.length > 0 && (
                <>
                    <p className="text-sm text-muted-foreground">
                        Período considerado:{' '}
                        <span className="font-medium text-foreground tabular-nums">
                            {formatDateTimeSeconds(ranking.period.from)} até{' '}
                            {formatDateTimeSeconds(ranking.period.to)}
                        </span>
                    </p>

                    <RankingChart criterion={ranking.criterion} items={ranking.items} />

                    <RankingTable criterion={ranking.criterion} items={ranking.items} />
                </>
            )}
        </PageShell>
    );
}
