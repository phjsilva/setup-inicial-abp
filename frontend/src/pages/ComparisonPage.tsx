import { useCallback, useMemo, useState } from 'react';

import { Info } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { PageShell } from '@/components/shared/PageShell';
import { Card, CardContent } from '@/components/ui/card';

import {
    ComparisonServiceSelector,
    type ComparisonServiceSelection,
} from '@/components/comparison/selector/ComparisonServiceSelector';

import {
    ComparisonControls,
    type ComparisonMetric,
} from '@/components/comparison/controls/ComparisonControls';

import { ComparisonChart } from '@/components/comparison/results/ComparisonChart';

import { ComparisonSummary } from '@/components/comparison/results/ComparisonSummary';

import { prepararDadosComparacao, type PreparedComparisonResponse } from '@/utils/comparison';

import { compareServices } from '@/api/comparisons';

import type { HistoryRange } from '@/types/service';

import type { ComparisonRequest, ComparisonResponse } from '@/types/comparison';

export function ComparisonPage() {
    // Configurações da comparação.
    const [periodo, setPeriodo] = useState<HistoryRange>('24h');

    const [metrica, setMetrica] = useState<ComparisonMetric>('co2eGrams');

    // Serviços atualmente escolhidos pelo usuário.
    const [servicosSelecionados, setServicosSelecionados] = useState<ComparisonServiceSelection[]>(
        [],
    );

    // Valida se a seleção permite executar uma comparação.
    const podeComparar = (() => {
        if (servicosSelecionados.length < 2) {
            return false;
        }

        const identificadores = servicosSelecionados.map((servico) =>
            JSON.stringify([servico.externalId, servico.simulatedRegion]),
        );

        return new Set(identificadores).size === identificadores.length;
    })();

    // Serviço atualmente escolhido como referência.
    const [servicoPrincipalId, setServicoPrincipalId] = useState<string | null>(null);

    // Resultado original da última comparação.
    const [respostaComparacao, setRespostaComparacao] = useState<ComparisonResponse | null>(null);

    // Fotografia dos serviços utilizados na última comparação.
    const [servicosComparados, setServicosComparados] = useState<ComparisonServiceSelection[]>([]);

    // Configuração que gerou a última comparação.
    const [configuracaoComparada, setConfiguracaoComparada] = useState<string | null>(null);

    // Configuração que está sendo preparada atualmente.
    // A referência não faz parte dessa configuração, pois pode ser trocada
    // sem precisar executar uma nova comparação.
    const configuracaoAtual = JSON.stringify({
        periodo,
        servicos: servicosSelecionados.map((servico) => ({
            selectionId: servico.selectionId,
            externalId: servico.externalId,
            simulatedRegion: servico.simulatedRegion,
        })),
    });

    // Verifica se existem alterações que exigem nova comparação.
    const comparacaoPendente =
        configuracaoComparada !== null && configuracaoComparada !== configuracaoAtual;

    // Recebe as informações enviadas pelo seletor.
    const handleSelectionsChange = useCallback(
        (selections: ComparisonServiceSelection[], principalId: string | null) => {
            setServicosSelecionados(selections);
            setServicoPrincipalId(principalId);
        },
        [],
    );

    const [comparacaoCarregando, setComparacaoCarregando] = useState(false);

    const [erroComparacao, setErroComparacao] = useState<string | null>(null);

    // Executa a comparação utilizando o backend.
    async function handleComparar() {
        if (!podeComparar || comparacaoCarregando) return;

        const request: ComparisonRequest = {
            range: periodo,

            selections: servicosSelecionados.map((item) => ({
                selectionId: item.selectionId,
                externalId: item.externalId,
                simulatedRegionCode: item.simulatedRegion,
            })),
        };

        setComparacaoCarregando(true);
        setErroComparacao(null);

        try {
            const resposta = await compareServices(request);

            // Salva o resultado original e a configuração que o gerou.
            setRespostaComparacao(resposta);
            setConfiguracaoComparada(configuracaoAtual);

            // Registra os serviços utilizados na última comparação.
            setServicosComparados(
                servicosSelecionados.map((servico) => ({
                    ...servico,
                })),
            );
        } catch (error) {
            setErroComparacao(
                error instanceof Error ? error.message : 'Não foi possível executar a comparação.',
            );
        } finally {
            setComparacaoCarregando(false);
        }
    }
    // Prepara os dados recebidos antes de enviá-los aos componentes visuais.
    // O useMemo evita repetir o processamento enquanto a resposta não mudar.
    const respostaPreparada = useMemo<PreparedComparisonResponse | null>(() => {
        if (respostaComparacao === null) {
            return null;
        }

        return prepararDadosComparacao(respostaComparacao);
    }, [respostaComparacao]);

    // Preserva os serviços da última comparação.
    // Atualiza somente suas cores quando o usuário as altera.
    const servicosExibidos = servicosComparados.map((servicoComparado) => {
        const servicoAtual = servicosSelecionados.find(
            (item) => item.selectionId === servicoComparado.selectionId,
        );

        return servicoAtual
            ? {
                  ...servicoComparado,
                  color: servicoAtual.color,
              }
            : servicoComparado;
    });

    // Prepara as séries que serão entregues ao gráfico.
    const seriesGrafico =
        respostaPreparada?.series.flatMap((serie) => {
            const servico = servicosExibidos.find((item) => item.selectionId === serie.selectionId);

            if (!servico) {
                return [];
            }

            return [
                {
                    selectionId: serie.selectionId,
                    name: servico.name,
                    color: servico.color,
                    points: serie.points,
                },
            ];
        }) ?? [];

    return (
        <PageShell>
            <PageHeader
                title="Comparar serviços"
                description="Selecione os serviços que deseja comparar, defina o período e analise as métricas no mesmo gráfico."
            />

            <section
                aria-label="Comparação de serviços"
                className="space-y-6 border-t border-border pt-6"
            >
                {/* Seleção dos serviços. */}
                <ComparisonServiceSelector onSelectionsChange={handleSelectionsChange} />

                {/* Configurações da comparação. */}
                <ComparisonControls
                    periodo={periodo}
                    metrica={metrica}
                    podeComparar={podeComparar && !comparacaoCarregando}
                    onPeriodoChange={setPeriodo}
                    onMetricaChange={setMetrica}
                    onComparar={handleComparar}
                />

                {comparacaoCarregando && (
                    <p className="text-sm text-muted-foreground" role="status">
                        Executando comparação...
                    </p>
                )}

                {erroComparacao && (
                    <p className="text-sm text-red-400" role="alert">
                        Erro ao executar comparação: {erroComparacao}
                    </p>
                )}

                {/* Aviso de alterações pendentes. */}
                {comparacaoPendente && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                        <Info className="mt-0.5 size-5 shrink-0 text-amber-400" />

                        <p className="text-sm text-slate-300">
                            Você alterou os serviços, o período ou a região de simulação. Os
                            resultados exibidos ainda correspondem à última comparação. Clique em
                            Comparar novamente para atualizar os dados.
                        </p>
                    </div>
                )}

                {/* Gráfico comparativo. */}
                {respostaPreparada !== null && (
                    <Card className="min-w-0">
                        <CardContent>
                            <ComparisonChart
                                series={seriesGrafico}
                                metrica={metrica}
                                periodo={respostaPreparada.range}
                                periodoInicio={respostaPreparada.period.from}
                                periodoFim={respostaPreparada.period.to}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Resumo comparativo. */}
                <ComparisonSummary
                    servicosSelecionados={servicosExibidos}
                    respostaComparacao={respostaPreparada}
                    metrica={metrica}
                    servicoPrincipalId={servicoPrincipalId}
                />
            </section>
        </PageShell>
    );
}
