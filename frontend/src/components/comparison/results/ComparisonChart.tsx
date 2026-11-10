import { useState } from 'react';

import {
    Area,
    CartesianGrid,
    ComposedChart,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import type { ComparisonMetric } from '@/components/comparison/controls/ComparisonControls';
import type { PreparedComparisonPoint } from '@/utils/comparison';
import type { HistoryRange } from '@/types/service';

interface ComparisonChartSeries {
    selectionId: string;
    name: string;
    color: string;
    points: PreparedComparisonPoint[];
}

interface ComparisonChartProps {
    series: ComparisonChartSeries[];
    metrica: ComparisonMetric;
    periodo: HistoryRange;
    periodoInicio: string;
    periodoFim: string;
}

interface PontoGrafico {
    timestamp: string;
    timestampMs: number;
    [selectionId: string]: string | number | null | boolean | undefined;
}

function formatarHorario(timestamp: string, periodo: HistoryRange): string {
    const data = new Date(timestamp);

    if (periodo === '7d' || periodo === '30d') {
        return data.toLocaleDateString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit',
            month: '2-digit',
        });
    }

    return data.toLocaleTimeString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// Distribui igualmente as marcações entre início e fim.
function gerarMarcacoesTempo(inicioMs: number, fimMs: number, quantidade: number): number[] {
    if (quantidade <= 1) {
        return [inicioMs];
    }

    const intervalo = (fimMs - inicioMs) / (quantidade - 1);

    return Array.from({ length: quantidade }, (_, indice) =>
        indice === quantidade - 1 ? fimMs : Math.round(inicioMs + intervalo * indice),
    );
}

function formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', {
        maximumFractionDigits: 4,
    });
}

function formatarValorMetrica(valor: unknown, metrica: ComparisonMetric): string {
    if (typeof valor !== 'number' || !Number.isFinite(valor)) {
        return 'Sem dados';
    }

    const unidade = metrica === 'co2eGrams' ? 'g CO₂e' : 'kWh';

    return `${formatarValor(valor)} ${unidade}`;
}

export function ComparisonChart({
    series,
    metrica,
    periodo,
    periodoInicio,
    periodoFim,
}: ComparisonChartProps) {
    const [larguraGrafico, setLarguraGrafico] = useState(0);

    // Celular: 4; tablet: 5; computador: 7 marcações.
    const quantidadeMarcacoes = larguraGrafico < 480 ? 4 : larguraGrafico < 850 ? 5 : 7;

    const dadosPorHorario = new Map<string, PontoGrafico>();

    // Verifica se existem valores estimados na métrica selecionada.
    const possuiEstimativas = series.some((servico) =>
        servico.points.some((ponto) => ponto.estimatedMetrics?.includes(metrica)),
    );

    // Agrupa os valores dos serviços pelo mesmo horário.
    for (const servico of series) {
        for (const ponto of servico.points) {
            const linha: PontoGrafico = dadosPorHorario.get(ponto.timestamp) ?? {
                timestamp: ponto.timestamp,
                timestampMs: new Date(ponto.timestamp).getTime(),
            };

            const valor = ponto[metrica];

            // Valor utilizado pela linha original do serviço.
            linha[servico.selectionId] = valor;

            // Valor utilizado exclusivamente pela linha estimada.
            const chaveEstimativa = `${servico.selectionId}__estimado`;

            linha[chaveEstimativa] =
                ponto.estimatedMetrics?.includes(metrica) &&
                typeof valor === 'number' &&
                Number.isFinite(valor)
                    ? valor
                    : null;

            dadosPorHorario.set(ponto.timestamp, linha);
        }
    }

    const dadosGrafico = [...dadosPorHorario.values()].sort(
        (a, b) => a.timestampMs - b.timestampMs,
    );

    const possuiDados = dadosGrafico.some((ponto) =>
        series.some((servico) => {
            const valor = ponto[servico.selectionId];

            return typeof valor === 'number' && Number.isFinite(valor);
        }),
    );

    const titulo =
        metrica === 'co2eGrams'
            ? 'Emissões ao longo do período'
            : 'Consumo de energia ao longo do período';

    const unidade = metrica === 'co2eGrams' ? '(gCO₂e)' : '(kWh)';

    if (!possuiDados) {
        return (
            <div className="w-full space-y-5">
                <div className="space-y-2 lg:pl-[73px]">
                    <h3 className="text-lg font-semibold">{titulo}</h3>

                    <p className="text-sm text-muted-foreground">{unidade}</p>
                </div>

                <div className="flex min-h-56 items-center justify-center text-sm text-muted-foreground">
                    Não há dados para exibir nesta métrica e neste período.
                </div>
            </div>
        );
    }

    const inicioMs = new Date(periodoInicio).getTime();
    const fimMs = new Date(periodoFim).getTime();

    const marcacoesTempo = gerarMarcacoesTempo(inicioMs, fimMs, quantidadeMarcacoes);

    return (
        <div className="w-full space-y-5">
            {/* Cabeçalho e legenda. */}
            <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4 lg:pl-[73px] lg:pr-3">
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{titulo}</h3>

                    <p className="text-sm text-muted-foreground">{unidade}</p>
                </div>

                <div className="flex flex-wrap items-center justify-start gap-x-6 gap-y-3 lg:justify-end">
                    {series.map((servico) => (
                        <div
                            key={servico.selectionId}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                            <span
                                className="size-2.5 shrink-0 rounded-full"
                                style={{
                                    backgroundColor: servico.color,
                                }}
                                aria-hidden="true"
                            />

                            <span>{servico.name}</span>
                        </div>
                    ))}

                    {/* Identificação dos pontos estimados. */}
                    {possuiEstimativas && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span
                                className="size-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: '#FBBF24' }}
                                aria-hidden="true"
                            />

                            <span>Valor estimado</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Gráfico comparativo. */}
            <div className="h-[300px] w-full">
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                    onResize={(largura) => setLarguraGrafico(Math.round(largura))}
                >
                    <ComposedChart
                        data={dadosGrafico}
                        margin={{
                            top: 4,
                            right: 12,
                            bottom: 4,
                            left: 8,
                        }}
                    >
                        <CartesianGrid
                            stroke="currentColor"
                            strokeOpacity={0.07}
                            strokeDasharray="3 3"
                            horizontal
                            vertical
                        />

                        <XAxis
                            type="number"
                            dataKey="timestampMs"
                            domain={[inicioMs, fimMs]}
                            ticks={marcacoesTempo}
                            interval={0}
                            tickFormatter={(valor) =>
                                formatarHorario(new Date(Number(valor)).toISOString(), periodo)
                            }
                            tick={{
                                fontSize: 11,
                                fill: 'currentColor',
                            }}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />

                        <YAxis
                            width={65}
                            domain={[
                                0,
                                (valorMaximo: number) => (valorMaximo > 0 ? valorMaximo * 1.2 : 1),
                            ]}
                            tickFormatter={(valor) => formatarValor(Number(valor))}
                            tick={{
                                fontSize: 11,
                                fill: 'currentColor',
                            }}
                            tickLine={false}
                            axisLine={false}
                        />

                        <Tooltip
                            labelFormatter={(valor) =>
                                formatarHorario(new Date(Number(valor)).toISOString(), periodo)
                            }
                            formatter={(valor, nome, item) => {
                                const ponto = item.payload as PontoGrafico | undefined;
                                const chaveEstimativa = `${String(item.dataKey)}__estimado`;

                                const estimado = typeof ponto?.[chaveEstimativa] === 'number';

                                const valorFormatado = formatarValorMetrica(valor, metrica);

                                return [
                                    estimado ? `${valorFormatado} (Estimado)` : valorFormatado,
                                    String(nome),
                                ];
                            }}
                            contentStyle={{
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                                backgroundColor: 'var(--background)',
                                padding: '12px',
                            }}
                        />

                        {/* Áreas transparentes dos serviços. */}
                        {series.map((servico) => (
                            <Area
                                key={`area-${servico.selectionId}`}
                                type="monotone"
                                dataKey={servico.selectionId}
                                name={servico.name}
                                baseValue={0}
                                fill={servico.color}
                                fillOpacity={0.08}
                                stroke="none"
                                dot={false}
                                activeDot={false}
                                connectNulls={false}
                                isAnimationActive="auto"
                                animationDuration={700}
                                animationEasing="ease-out"
                                legendType="none"
                                tooltipType="none"
                            />
                        ))}

                        {/* Linhas originais dos serviços. */}
                        {series.map((servico) => (
                            <Line
                                key={servico.selectionId}
                                type="monotone"
                                dataKey={servico.selectionId}
                                name={servico.name}
                                stroke={servico.color}
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={{ r: 4 }}
                                connectNulls={false}
                                isAnimationActive="auto"
                                animationDuration={700}
                                animationEasing="ease-out"
                            />
                        ))}

                        {/* Linhas amarelas que conectam somente os pontos estimados. */}
                        {possuiEstimativas &&
                            series.map((servico) => {
                                const chaveEstimativa = `${servico.selectionId}__estimado`;

                                return (
                                    <Line
                                        key={`estimativa-${servico.selectionId}`}
                                        type="monotone"
                                        dataKey={chaveEstimativa}
                                        name={`${servico.name} (estimado)`}
                                        stroke="#FBBF24"
                                        strokeWidth={3}
                                        dot={(props) => {
                                            const { cx, cy, index } = props;

                                            if (
                                                typeof cx !== 'number' ||
                                                typeof cy !== 'number' ||
                                                typeof index !== 'number'
                                            ) {
                                                return <></>;
                                            }

                                            const valorAtual =
                                                dadosGrafico[index]?.[chaveEstimativa];

                                            if (typeof valorAtual !== 'number') {
                                                return <></>;
                                            }

                                            const valorAnterior =
                                                index > 0
                                                    ? dadosGrafico[index - 1]?.[chaveEstimativa]
                                                    : null;

                                            const proximoValor =
                                                index < dadosGrafico.length - 1
                                                    ? dadosGrafico[index + 1]?.[chaveEstimativa]
                                                    : null;

                                            const inicioEstimativa =
                                                typeof valorAnterior !== 'number';

                                            const fimEstimativa = typeof proximoValor !== 'number';

                                            // Mostra somente o início e o fim de cada região estimada.
                                            if (!inicioEstimativa && !fimEstimativa) {
                                                return <></>;
                                            }

                                            return (
                                                <circle
                                                    cx={cx}
                                                    cy={cy}
                                                    r={5}
                                                    fill="#FBBF24"
                                                    stroke="#92400E"
                                                    strokeWidth={1.5}
                                                />
                                            );
                                        }}
                                        activeDot={false}
                                        connectNulls={false}
                                        isAnimationActive="auto"
                                        animationDuration={700}
                                        animationEasing="ease-out"
                                        legendType="none"
                                        tooltipType="none"
                                    />
                                );
                            })}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
