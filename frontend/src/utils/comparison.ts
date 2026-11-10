import type { ComparisonPoint, ComparisonResponse, ComparisonSeries } from '@/types/comparison';

// Intervalo entre as coletas do GreenER.
const INTERVALO_COLETA_MS = 30_000;

type ComparisonMetricKey = 'energyKwh' | 'co2eGrams';

export type ComparisonMetricStatus = 'available' | 'estimated' | 'incomplete' | 'unavailable';

// Identifica quais métricas de um ponto foram estimadas.
export interface PreparedComparisonPoint extends ComparisonPoint {
    estimatedMetrics?: ComparisonMetricKey[];
}

// Informações sobre a cobertura dos dados de cada métrica.
export interface PreparedComparisonMetricCoverage {
    status: ComparisonMetricStatus;
    expectedSampleCount: number | null;
    collectedSampleCount: number;
    estimatedSampleCount: number;
    historyStart: string | null;
    lastObservedAt: string | null;
    hasPartialHistory: boolean;
}

// Acrescenta informações sobre a disponibilidade dos dados.
export interface PreparedComparisonSeries extends Omit<ComparisonSeries, 'points'> {
    points: PreparedComparisonPoint[];
    metricStatus: Record<ComparisonMetricKey, ComparisonMetricStatus>;
    metricCoverage: Record<ComparisonMetricKey, PreparedComparisonMetricCoverage>;
}

export interface PreparedComparisonResponse extends Omit<ComparisonResponse, 'series'> {
    series: PreparedComparisonSeries[];
}

interface Ancora {
    indice: number;
    timestampMs: number;
    taxaPorAmostra: number;
    quantidadeAmostras: number;
}

interface ResultadoPreparacao {
    points: PreparedComparisonPoint[];
    status: ComparisonMetricStatus;
    coverage: PreparedComparisonMetricCoverage;
}

// Verifica se um número é válido.
// Zero continua sendo considerado um valor válido.
function valorValido(valor: number | null | undefined): valor is number {
    return typeof valor === 'number' && Number.isFinite(valor);
}

// Arredonda os valores para evitar excesso de casas decimais.
function arredondar(valor: number): number {
    return Number(valor.toFixed(8));
}

// Calcula quantas coletas deveriam existir em cada ponto do gráfico.
function calcularAmostrasEsperadas(
    resposta: ComparisonResponse,
    quantidadePontos: number,
): number | null {
    if (quantidadePontos === 0) {
        return null;
    }

    const inicio = new Date(resposta.period.from).getTime();
    const fim = new Date(resposta.period.to).getTime();

    if (!Number.isFinite(inicio) || !Number.isFinite(fim) || fim <= inicio) {
        return null;
    }

    const duracaoPorPonto = (fim - inicio) / quantidadePontos;

    return Math.max(1, Math.round(duracaoPorPonto / INTERVALO_COLETA_MS));
}

// Obtém a quantidade de coletas registradas no ponto.
// Não permite que ultrapasse a quantidade esperada.
function obterQuantidadeAmostras(ponto: ComparisonPoint, amostrasEsperadas: number | null): number {
    if (!Number.isFinite(ponto.sampleCount) || ponto.sampleCount <= 0) {
        return 0;
    }

    const quantidade = Math.floor(ponto.sampleCount);

    return amostrasEsperadas === null ? quantidade : Math.min(quantidade, amostrasEsperadas);
}

// Marca uma métrica como estimada sem duplicar sua identificação.
function marcarComoEstimado(ponto: PreparedComparisonPoint, metrica: ComparisonMetricKey): void {
    const metricasEstimadas = new Set(ponto.estimatedMetrics ?? []);

    metricasEstimadas.add(metrica);

    ponto.estimatedMetrics = [...metricasEstimadas];
}

// Calcula uma taxa intermediária entre duas coletas válidas.
function interpolarTaxa(
    ponto: PreparedComparisonPoint,
    indice: number,
    anterior: Ancora,
    posterior: Ancora,
): number {
    const tempoPonto = new Date(ponto.timestamp).getTime();

    const duracao = posterior.timestampMs - anterior.timestampMs;

    const proporcaoTempo =
        duracao > 0
            ? (tempoPonto - anterior.timestampMs) / duracao
            : (indice - anterior.indice) / (posterior.indice - anterior.indice);

    const proporcao = Math.max(0, Math.min(1, proporcaoTempo));

    return (
        anterior.taxaPorAmostra + (posterior.taxaPorAmostra - anterior.taxaPorAmostra) * proporcao
    );
}

// Prepara uma métrica individual dos pontos de uma série.
function prepararMetrica(
    pontos: ComparisonPoint[],
    metrica: ComparisonMetricKey,
    amostrasEsperadas: number | null,
): ResultadoPreparacao {
    // Ordena os pontos cronologicamente e prepara a identificação das estimativas.
    const points: PreparedComparisonPoint[] = [...pontos]
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map((ponto) => ({
            ...ponto,
            estimatedMetrics: [],
        }));

    // Identifica os pontos que possuem métricas reais.
    const ancoras: Ancora[] = [];

    points.forEach((ponto, indice) => {
        const valor = ponto[metrica];

        const quantidadeAmostras = obterQuantidadeAmostras(ponto, amostrasEsperadas);

        if (!valorValido(valor) || quantidadeAmostras === 0) {
            ponto[metrica] = null;
            return;
        }

        ancoras.push({
            indice,
            timestampMs: new Date(ponto.timestamp).getTime(),
            taxaPorAmostra: valor / quantidadeAmostras,
            quantidadeAmostras,
        });
    });

    // Sem nenhuma coleta válida, não existe referência para estimar valores.
    if (ancoras.length === 0) {
        return {
            points,
            status: 'unavailable',
            coverage: {
                status: 'unavailable',
                expectedSampleCount:
                    amostrasEsperadas === null ? null : amostrasEsperadas * points.length,
                collectedSampleCount: 0,
                estimatedSampleCount: 0,
                historyStart: null,
                lastObservedAt: null,
                hasPartialHistory: false,
            },
        };
    }

    const primeiraAncora = ancoras[0];
    const ultimaAncora = ancoras[ancoras.length - 1];

    let estimativasRealizadas = 0;

    // Identifica o início de um histórico parcial.
    // Não estimamos valores anteriores à primeira coleta válida.
    const possuiHistoricoParcial =
        primeiraAncora.indice > 0 ||
        (amostrasEsperadas !== null && primeiraAncora.quantidadeAmostras < amostrasEsperadas);

    // INTERPOLAÇÃO:
    // Recupera ausências localizadas entre duas coletas válidas.
    for (let indice = primeiraAncora.indice + 1; indice < ultimaAncora.indice; indice++) {
        const ponto = points[indice];

        const valorAtual = ponto[metrica];

        const quantidadeAtual = valorValido(valorAtual)
            ? obterQuantidadeAmostras(ponto, amostrasEsperadas)
            : 0;

        if (amostrasEsperadas === null) {
            continue;
        }

        const amostrasAusentes = Math.max(0, amostrasEsperadas - quantidadeAtual);

        if (amostrasAusentes === 0) {
            continue;
        }

        // Procura a coleta válida imediatamente anterior.
        const anterior = [...ancoras].reverse().find((ancora) => ancora.indice < indice);

        // Procura a coleta válida imediatamente posterior.
        const posterior = ancoras.find((ancora) => ancora.indice > indice);

        if (!anterior || !posterior) {
            continue;
        }

        // Estima a média por coleta entre os dois pontos válidos.
        const taxaEstimada = interpolarTaxa(ponto, indice, anterior, posterior);

        const valorExistente = valorValido(valorAtual) ? valorAtual : 0;

        ponto[metrica] = arredondar(valorExistente + taxaEstimada * amostrasAusentes);

        marcarComoEstimado(ponto, metrica);

        estimativasRealizadas += amostrasAusentes;
    }

    // ESTIMATIVA RECENTE:
    // Após a última coleta válida, utiliza provisoriamente sua média por coleta.
    if (amostrasEsperadas !== null) {
        const pontoUltimo = points[ultimaAncora.indice];

        const valorUltimo = pontoUltimo[metrica] as number;

        const amostrasAusentesNoUltimo = Math.max(
            0,
            amostrasEsperadas - ultimaAncora.quantidadeAmostras,
        );

        // Completa somente as coletas ausentes do último agrupamento.
        if (amostrasAusentesNoUltimo > 0) {
            pontoUltimo[metrica] = arredondar(
                valorUltimo + ultimaAncora.taxaPorAmostra * amostrasAusentesNoUltimo,
            );

            marcarComoEstimado(pontoUltimo, metrica);

            estimativasRealizadas += amostrasAusentesNoUltimo;
        }

        // Preenche os agrupamentos posteriores à última coleta válida.
        for (let indice = ultimaAncora.indice + 1; indice < points.length; indice++) {
            const ponto = points[indice];

            ponto[metrica] = arredondar(ultimaAncora.taxaPorAmostra * amostrasEsperadas);

            marcarComoEstimado(ponto, metrica);

            estimativasRealizadas += amostrasEsperadas;
        }
    }

    // Conta quantas coletas reais foram utilizadas.
    const coletasReais = ancoras.reduce((total, ancora) => total + ancora.quantidadeAmostras, 0);

    // Verifica se ainda existem pontos sem informação.
    const possuiPontosAusentes = points.some((ponto) => !valorValido(ponto[metrica]));

    // Define o estado final da métrica.
    let status: ComparisonMetricStatus;

    if (possuiHistoricoParcial || possuiPontosAusentes) {
        status = 'incomplete';
    } else if (estimativasRealizadas > 0) {
        status = 'estimated';
    } else {
        status = 'available';
    }

    return {
        points,
        status,
        coverage: {
            status,
            expectedSampleCount:
                amostrasEsperadas === null ? null : amostrasEsperadas * points.length,
            collectedSampleCount: coletasReais,
            estimatedSampleCount: estimativasRealizadas,
            historyStart: points[primeiraAncora.indice].timestamp,
            lastObservedAt: points[ultimaAncora.indice].timestamp,
            hasPartialHistory: possuiHistoricoParcial,
        },
    };
}

// Calcula o total dos valores reais e estimados disponíveis.
// Não descarta o resultado apenas porque existe histórico parcial.
function calcularTotal(
    pontos: PreparedComparisonPoint[],
    metrica: ComparisonMetricKey,
): number | null {
    const valoresDisponiveis = pontos.map((ponto) => ponto[metrica]).filter(valorValido);

    if (valoresDisponiveis.length === 0) {
        return null;
    }

    const total = valoresDisponiveis.reduce((soma, valor) => soma + valor, 0);

    return arredondar(total);
}

// Prepara todas as séries antes de enviá-las ao gráfico e ao resumo.
export function prepararDadosComparacao(resposta: ComparisonResponse): PreparedComparisonResponse {
    return {
        ...resposta,

        series: resposta.series.map((serie) => {
            // Quando não existem pontos, utiliza os totais já recebidos.
            if (serie.points.length === 0) {
                const energiaDisponivel = valorValido(serie.summary.energyKwh);
                const emissoesDisponiveis = valorValido(serie.summary.co2eGrams);

                const statusEnergia: ComparisonMetricStatus = energiaDisponivel
                    ? 'available'
                    : 'unavailable';

                const statusEmissoes: ComparisonMetricStatus = emissoesDisponiveis
                    ? 'available'
                    : 'unavailable';

                return {
                    ...serie,
                    metricStatus: {
                        energyKwh: statusEnergia,
                        co2eGrams: statusEmissoes,
                    },
                    metricCoverage: {
                        energyKwh: {
                            status: statusEnergia,
                            expectedSampleCount: null,
                            collectedSampleCount: serie.summary.sampleCount,
                            estimatedSampleCount: 0,
                            historyStart: null,
                            lastObservedAt: null,
                            hasPartialHistory: false,
                        },
                        co2eGrams: {
                            status: statusEmissoes,
                            expectedSampleCount: null,
                            collectedSampleCount: serie.summary.sampleCount,
                            estimatedSampleCount: 0,
                            historyStart: null,
                            lastObservedAt: null,
                            hasPartialHistory: false,
                        },
                    },
                };
            }

            const amostrasEsperadas = calcularAmostrasEsperadas(resposta, serie.points.length);

            // Processa energia e emissões separadamente.
            const energia = prepararMetrica(serie.points, 'energyKwh', amostrasEsperadas);

            const emissoes = prepararMetrica(serie.points, 'co2eGrams', amostrasEsperadas);

            // Combina os pontos preparados das duas métricas.
            const points = energia.points.map((ponto, indice) => {
                const pontoEmissoes = emissoes.points[indice];

                const metricasEstimadas = new Set([
                    ...(ponto.estimatedMetrics ?? []),
                    ...(pontoEmissoes.estimatedMetrics ?? []),
                ]);

                return {
                    ...ponto,
                    co2eGrams: pontoEmissoes.co2eGrams,
                    estimatedMetrics:
                        metricasEstimadas.size > 0 ? [...metricasEstimadas] : undefined,
                };
            });

            return {
                ...serie,

                points,

                // Soma os valores reais e estimados disponíveis.
                summary: {
                    ...serie.summary,
                    energyKwh: calcularTotal(points, 'energyKwh'),
                    co2eGrams: calcularTotal(points, 'co2eGrams'),
                },

                metricStatus: {
                    energyKwh: energia.status,
                    co2eGrams: emissoes.status,
                },

                metricCoverage: {
                    energyKwh: energia.coverage,
                    co2eGrams: emissoes.coverage,
                },
            };
        }),
    };
}
