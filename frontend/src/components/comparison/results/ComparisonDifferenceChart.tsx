import { ArrowDown, ArrowUp, ArrowUpDown, Minus } from 'lucide-react';

import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';

type ClassificacaoComparacao = 'acima' | 'abaixo' | 'igual' | 'indisponivel';

interface ComparisonDifferenceChartProps {
    percentual: number | null;
    classificacao: ClassificacaoComparacao;
    descricao: string;
    descricaoAntes?: string;
    valorDestaque?: string | null;
    descricaoDepois?: string;
}

function formatarPercentual(valor: number): string {
    return Math.abs(valor).toLocaleString('pt-BR', {
        maximumFractionDigits: 1,
    });
}

export function ComparisonDifferenceChart({
    percentual,
    classificacao,
    descricao,
    descricaoAntes,
    valorDestaque,
    descricaoDepois,
}: ComparisonDifferenceChartProps) {
    const percentualValido = percentual !== null && Number.isFinite(percentual);

    const magnitude =
        percentualValido && classificacao !== 'indisponivel'
            ? Math.min(Math.abs(percentual), 100)
            : 0;

    const diferencaComSinal =
        classificacao === 'acima' ? magnitude : classificacao === 'abaixo' ? -magnitude : 0;

    const proporcaoReferencia = 50 + diferencaComSinal / 2;
    const proporcaoMedia = 100 - proporcaoReferencia;

    const dadosGrafico = [
        {
            referencia: proporcaoReferencia,
            media: proporcaoMedia,
        },
    ];

    const corReferencia = classificacao === 'indisponivel' ? '#64748B' : '#2DD4BF';

    const corMedia = '#475569';

    const corTexto =
        classificacao === 'acima'
            ? 'text-rose-400'
            : classificacao === 'abaixo'
              ? 'text-emerald-400'
              : classificacao === 'igual'
                ? 'text-slate-200'
                : 'text-slate-400';

    const IconeDirecao =
        classificacao === 'acima'
            ? ArrowUp
            : classificacao === 'abaixo'
              ? ArrowDown
              : classificacao === 'igual'
                ? Minus
                : ArrowUpDown;

    const textoDirecao =
        classificacao === 'acima'
            ? 'Acima da média'
            : classificacao === 'abaixo'
              ? 'Abaixo da média'
              : classificacao === 'igual'
                ? 'Igual à média'
                : 'Comparação indisponível';

    return (
        <div className="flex w-full flex-col items-center gap-2 text-center">
            {/* Medidor radial */}
            <div className="relative mx-auto aspect-[2/1] w-full max-w-[280px] overflow-hidden">
                <div className="aspect-square w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                            data={dadosGrafico}
                            startAngle={180}
                            endAngle={0}
                            innerRadius="62%"
                            outerRadius="96%"
                        >
                            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />

                            {/* Serviço de referência */}
                            <RadialBar
                                dataKey="referencia"
                                stackId="comparacao"
                                fill={corReferencia}
                                cornerRadius={0}
                            />

                            {/* Média dos demais serviços */}
                            <RadialBar
                                dataKey="media"
                                stackId="comparacao"
                                fill={corMedia}
                                cornerRadius={0}
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>
                </div>

                {/* Indicador central de 0% */}
                <svg
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    viewBox="0 0 100 50"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    <line
                        x1="50"
                        y1="19"
                        x2="50"
                        y2="49"
                        stroke="#94A3B8"
                        strokeWidth="0.45"
                        strokeDasharray="1.5 1.8"
                        opacity="0.65"
                    />
                </svg>
            </div>

            {/* Percentual em destaque */}
            <p
                className={`w-full text-center text-4xl font-semibold leading-none tabular-nums ${corTexto}`}
            >
                {percentualValido && percentual !== null
                    ? `${formatarPercentual(percentual)}%`
                    : '—'}
            </p>

            {/* Classificação centralizada */}
            <div
                className={`flex w-full items-center justify-center gap-2 text-sm font-semibold ${corTexto}`}
            >
                <IconeDirecao className="size-4 shrink-0" />

                <span>{textoDirecao}</span>
            </div>

            {/* Descrição com valor destacado */}
            <p className="w-full text-center text-xs leading-relaxed text-slate-400">
                {valorDestaque !== null && valorDestaque !== undefined ? (
                    <>
                        {descricaoAntes}

                        <strong className="font-bold text-slate-200">{valorDestaque}</strong>

                        {descricaoDepois}
                    </>
                ) : (
                    descricao
                )}
            </p>
        </div>
    );
}
