import { useState } from 'react';
import { createPortal } from 'react-dom';

import { Info, Leaf, Percent, Star, UsersRound } from 'lucide-react';

import type { ComparisonMetric } from '@/components/comparison/controls/ComparisonControls';
import type { ComparisonServiceSelection } from '@/components/comparison/selector/ComparisonServiceSelector';

import type { PreparedComparisonResponse, PreparedComparisonSeries } from '@/utils/comparison';

import { ComparisonDifferenceChart } from './ComparisonDifferenceChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ComparisonSummaryProps {
    servicosSelecionados: ComparisonServiceSelection[];
    respostaComparacao: PreparedComparisonResponse | null;
    metrica: ComparisonMetric;
    servicoPrincipalId: string | null;
}

type ClassificacaoComparacao = 'acima' | 'abaixo' | 'igual' | 'indisponivel';

interface PosicaoTooltip {
    x: number;
    y: number;
}

function formatarValor(valor: number | null, metrica: ComparisonMetric): string {
    if (valor === null || !Number.isFinite(valor)) {
        return '—';
    }

    return valor.toLocaleString('pt-BR', {
        maximumFractionDigits: metrica === 'energyKwh' ? 4 : 2,
    });
}

// Obtém a quantidade de coletas reais, estimadas e sem métricas.
function obterEstatisticas(serie: PreparedComparisonSeries | undefined, metrica: ComparisonMetric) {
    if (!serie) {
        return {
            reais: 0,
            estimadas: 0,
            semMetricas: 0,
        };
    }

    const cobertura = serie.metricCoverage[metrica];

    const reais = cobertura.collectedSampleCount;
    const estimadas = cobertura.estimatedSampleCount;

    const semMetricas =
        cobertura.expectedSampleCount !== null
            ? Math.max(0, cobertura.expectedSampleCount - reais - estimadas)
            : 0;

    return {
        reais,
        estimadas,
        semMetricas,
    };
}

// Tooltip renderizado fora da tabela para não sofrer cortes de overflow.
function TooltipColetas({
    nomeServico,
    serie,
    metrica,
}: {
    nomeServico: string;
    serie: PreparedComparisonSeries | undefined;
    metrica: ComparisonMetric;
}) {
    const [posicao, setPosicao] = useState<PosicaoTooltip | null>(null);

    const estatisticas = obterEstatisticas(serie, metrica);

    function atualizarPosicao(x: number, y: number) {
        const larguraTooltip = 240;
        const alturaTooltip = 155;

        setPosicao({
            x: Math.max(8, Math.min(x + 12, window.innerWidth - larguraTooltip - 8)),
            y: Math.max(8, Math.min(y + 12, window.innerHeight - alturaTooltip - 8)),
        });
    }

    return (
        <>
            <span
                className="truncate font-medium"
                tabIndex={0}
                aria-label={`${nomeServico}. Consulte o detalhamento das coletas.`}
                onMouseEnter={(evento) => atualizarPosicao(evento.clientX, evento.clientY)}
                onMouseMove={(evento) => atualizarPosicao(evento.clientX, evento.clientY)}
                onMouseLeave={() => setPosicao(null)}
                onFocus={(evento) => {
                    const rect = evento.currentTarget.getBoundingClientRect();

                    atualizarPosicao(rect.left + rect.width / 2, rect.top);
                }}
                onBlur={() => setPosicao(null)}
            >
                {nomeServico}
            </span>

            {posicao &&
                createPortal(
                    <div
                        role="tooltip"
                        className="pointer-events-none fixed z-[9999] w-60 rounded-lg border border-slate-700 bg-slate-900 p-3 text-xs text-slate-300 shadow-2xl"
                        style={{
                            left: posicao.x,
                            top: posicao.y,
                        }}
                    >
                        <strong className="mb-3 block text-slate-100">
                            Detalhamento das coletas
                        </strong>

                        <div className="flex items-center justify-between gap-3 py-1">
                            <span className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-teal-400" />
                                Reais
                            </span>

                            <strong className="text-slate-100">{estatisticas.reais}</strong>
                        </div>

                        <div className="flex items-center justify-between gap-3 py-1">
                            <span className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-amber-400" />
                                Estimadas
                            </span>

                            <strong className="text-slate-100">{estatisticas.estimadas}</strong>
                        </div>

                        <div className="flex items-center justify-between gap-3 py-1">
                            <span className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-slate-500" />
                                Sem métricas
                            </span>

                            <strong className="text-slate-100">{estatisticas.semMetricas}</strong>
                        </div>
                    </div>,
                    document.body,
                )}
        </>
    );
}

export function ComparisonSummary({
    servicosSelecionados,
    respostaComparacao,
    metrica,
    servicoPrincipalId,
}: ComparisonSummaryProps) {
    const unidade = metrica === 'co2eGrams' ? 'gCO₂e' : 'kWh';

    const tituloMetrica = metrica === 'co2eGrams' ? 'Emissões' : 'Energia';

    const tituloValor = metrica === 'co2eGrams' ? 'Emissões (gCO₂e)' : 'Energia (kWh)';

    const series = respostaComparacao?.series ?? [];

    const servicoPrincipal = servicosSelecionados.find(
        (item) => item.selectionId === servicoPrincipalId,
    );

    const seriePrincipal = series.find((serie) => serie.selectionId === servicoPrincipalId);

    const valorPrincipalBruto = seriePrincipal?.summary[metrica];

    const valorPrincipal =
        typeof valorPrincipalBruto === 'number' && Number.isFinite(valorPrincipalBruto)
            ? valorPrincipalBruto
            : null;

    // Obtém somente os valores disponíveis dos demais serviços.
    const valoresDemais = servicosSelecionados.flatMap((servico) => {
        if (servico.selectionId === servicoPrincipalId) {
            return [];
        }

        const serie = series.find((item) => item.selectionId === servico.selectionId);

        const valor = serie?.summary[metrica];

        return typeof valor === 'number' && Number.isFinite(valor) ? [valor] : [];
    });

    // Média aritmética dos serviços com valores disponíveis.
    const mediaDemais =
        valoresDemais.length > 0
            ? valoresDemais.reduce((total, valor) => total + valor, 0) / valoresDemais.length
            : null;

    const diferencaAbsoluta =
        valorPrincipal !== null && mediaDemais !== null ? valorPrincipal - mediaDemais : null;

    const classificacao: ClassificacaoComparacao =
        diferencaAbsoluta === null
            ? 'indisponivel'
            : diferencaAbsoluta > 0
              ? 'acima'
              : diferencaAbsoluta < 0
                ? 'abaixo'
                : 'igual';

    const diferencaPercentual =
        diferencaAbsoluta === null || mediaDemais === null
            ? null
            : mediaDemais === 0
              ? diferencaAbsoluta === 0
                  ? 0
                  : null
              : (diferencaAbsoluta / mediaDemais) * 100;

    const descricaoDiferenca =
        diferencaAbsoluta === null
            ? 'Não há valores disponíveis suficientes para realizar essa comparação.'
            : classificacao === 'igual'
              ? 'O serviço de referência apresenta o mesmo valor que a média dos demais.'
              : `${servicoPrincipal?.name ?? 'O serviço de referência'} ${
                    metrica === 'co2eGrams' ? 'emitiu' : 'consumiu'
                } ${formatarValor(Math.abs(diferencaAbsoluta), metrica)} ${unidade} ${
                    classificacao === 'acima' ? 'a mais' : 'a menos'
                } que a média dos demais.${
                    diferencaPercentual === null
                        ? ' Não é possível calcular o percentual porque a média dos demais é zero.'
                        : ''
                }`;

    const descricaoAntes = `${servicoPrincipal?.name ?? 'O serviço de referência'} ${
        metrica === 'co2eGrams' ? 'emitiu' : 'consumiu'
    } `;

    const valorDestaque =
        diferencaAbsoluta !== null && classificacao !== 'igual'
            ? `${formatarValor(Math.abs(diferencaAbsoluta), metrica)} ${unidade}`
            : null;

    const descricaoDepois = ` ${
        classificacao === 'acima' ? 'a mais' : 'a menos'
    } que a média dos demais.${
        diferencaPercentual === null
            ? ' Não é possível calcular o percentual porque a média dos demais é zero.'
            : ''
    }`;

    return (
        <section className="space-y-4">
            {/* Cabeçalho */}
            <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-teal-400/10">
                    <Leaf className="size-5 text-teal-300" aria-hidden="true" />
                </div>

                <div className="min-w-0 space-y-1">
                    <h3 className="text-lg font-semibold text-slate-100">
                        Resumo comparativo — {tituloMetrica}
                    </h3>

                    <p className="text-xs text-slate-400 sm:text-sm">
                        O serviço de referência é comparado com a média dos demais serviços
                        selecionados.
                    </p>
                </div>
            </div>

            {!respostaComparacao ? (
                <Card className="min-h-16">
                    <CardContent className="flex flex-1 items-center justify-center gap-2">
                        <p className="text-center text-sm text-muted-foreground">
                            Selecione pelo menos dois serviços e clique em Comparar para ver os
                            resultados.
                        </p>

                        <span className="group relative inline-flex shrink-0">
                            <button
                                type="button"
                                aria-label="Informações sobre como comparar serviços"
                                className="flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <Info className="size-4" />
                            </button>

                            <span
                                role="tooltip"
                                className="invisible absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-lg border border-border bg-popover p-3 text-left text-xs leading-relaxed text-popover-foreground opacity-0 shadow-xl transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
                            >
                                <strong className="mb-2 block">Como fazer uma comparação</strong>

                                <span className="mb-2 block">1. Selecione de 2 a 5 serviços.</span>

                                <span className="mb-2 block">
                                    2. Defina o serviço de referência.
                                </span>

                                <span className="mb-2 block">3. Escolha o período analisado.</span>

                                <span className="block">
                                    4. Escolha uma região para simular as emissões.
                                </span>
                            </span>
                        </span>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-12 xl:items-stretch">
                    {/* COLUNA ESQUERDA: REFERÊNCIA E MÉDIA */}
                    <div className="grid min-h-[320px] min-w-0 grid-rows-2 gap-3 xl:col-span-4 xl:h-[320px]">
                        {/* Serviço de referência */}
                        <Card className="flex h-full min-h-0 min-w-0 flex-col justify-between">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star
                                        className="size-4 fill-teal-400 text-teal-400"
                                        aria-hidden="true"
                                    />
                                    Serviço de referência
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="flex flex-1 flex-col justify-end gap-1 pt-0">
                                <p className="text-3xl font-semibold tabular-nums sm:text-4xl">
                                    {formatarValor(valorPrincipal, metrica)}

                                    {valorPrincipal !== null && (
                                        <span className="ml-2 text-base font-medium text-muted-foreground">
                                            {unidade}
                                        </span>
                                    )}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                    {valorPrincipal !== null ? (
                                        <>
                                            {metrica === 'co2eGrams'
                                                ? 'Total de emissões de '
                                                : 'Total de energia consumida por '}

                                            <strong className="font-bold">
                                                {servicoPrincipal?.name ?? 'serviço'}
                                            </strong>

                                            {' no período'}
                                        </>
                                    ) : (
                                        'Sem métricas disponíveis'
                                    )}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Média dos demais serviços */}
                        <Card className="flex h-full min-h-0 min-w-0 flex-col justify-between">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UsersRound className="size-5 shrink-0 text-slate-300" />
                                    Média dos demais serviços
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="flex flex-1 flex-col justify-end gap-1 pt-0">
                                <p className="text-3xl font-semibold tabular-nums sm:text-4xl">
                                    {formatarValor(mediaDemais, metrica)}

                                    {mediaDemais !== null && (
                                        <span className="ml-2 text-base font-medium text-muted-foreground">
                                            {unidade}
                                        </span>
                                    )}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                    {mediaDemais !== null
                                        ? `Média de ${valoresDemais.length} ${
                                              valoresDemais.length === 1 ? 'serviço' : 'serviços'
                                          } com valores disponíveis.`
                                        : 'Não há outros serviços com valores disponíveis.'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* COLUNA CENTRAL: DIFERENÇA PERCENTUAL */}
                    <Card className="flex min-h-[320px] min-w-0 flex-col overflow-hidden xl:col-span-5 xl:h-[320px]">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                Diferença percentual
                                <Percent className="size-6 text-slate-300" />
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="flex-1 pt-6">
                            <ComparisonDifferenceChart
                                percentual={diferencaPercentual}
                                classificacao={classificacao}
                                descricao={descricaoDiferenca}
                                descricaoAntes={descricaoAntes}
                                valorDestaque={valorDestaque}
                                descricaoDepois={descricaoDepois}
                            />
                        </CardContent>
                    </Card>

                    {/* COLUNA DIREITA: VALORES INDIVIDUAIS */}
                    <Card className="flex h-[320px] min-w-0 flex-col overflow-hidden xl:col-span-3">
                        <CardHeader>
                            <CardTitle>Valores individuais</CardTitle>
                        </CardHeader>

                        <CardContent className="min-h-0 flex-1 overflow-y-auto">
                            <table className="w-full min-w-[210px] text-left text-xs">
                                <thead>
                                    <tr className="border-b border-border text-muted-foreground">
                                        <th className="pb-3 pr-2 font-medium">Serviço</th>

                                        <th className="pb-3 text-right font-medium whitespace-nowrap">
                                            {tituloValor}
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {servicosSelecionados.map((servico) => {
                                        const serie = series.find(
                                            (item) => item.selectionId === servico.selectionId,
                                        );

                                        const valorBruto = serie?.summary[metrica];

                                        const valor =
                                            typeof valorBruto === 'number' &&
                                            Number.isFinite(valorBruto)
                                                ? valorBruto
                                                : null;

                                        return (
                                            <tr
                                                key={servico.selectionId}
                                                className="border-b border-border/70 last:border-0"
                                            >
                                                <td className="py-3 pr-2">
                                                    <div className="flex min-w-0 items-center gap-2">
                                                        <span
                                                            className="size-2.5 shrink-0 rounded-full"
                                                            style={{
                                                                backgroundColor: servico.color,
                                                            }}
                                                            aria-hidden="true"
                                                        />

                                                        <TooltipColetas
                                                            nomeServico={servico.name}
                                                            serie={serie}
                                                            metrica={metrica}
                                                        />
                                                    </div>
                                                </td>

                                                <td className="py-3 text-right font-medium tabular-nums whitespace-nowrap">
                                                    {valor !== null ? (
                                                        formatarValor(valor, metrica)
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            Sem métricas
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {servicosSelecionados.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={2}
                                                className="py-5 text-center text-muted-foreground"
                                            >
                                                Nenhum serviço selecionado.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>
            )}
        </section>
    );
}
