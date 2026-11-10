import { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';

import type { ServiceSummary } from '@/types/service';

import { useClickOutside } from '@/hooks/useClickOutside';
import { useServices } from '@/hooks/useServices';
import { useRegions } from '@/hooks/useRegions';

import { AvailableServicesPicker } from './AvailableServicesPicker';
import { ComparisonServiceCard } from './ComparisonServiceCard';

interface ServicoSelecionado {
    idSelecao: string;
    servico: ServiceSummary;
    cor: string;
    regiaoSimulada: string | null;
}

export interface ComparisonServiceSelection {
    selectionId: string;
    externalId: string;
    name: string;
    color: string;
    simulatedRegion: string | null;
}

interface ComparisonServiceSelectorProps {
    onSelectionsChange: (
        selections: ComparisonServiceSelection[],
        principalId: string | null,
    ) => void;
}

const MAX_SERVICOS = 5;

const CORES = ['#60A5FA', '#34D399', '#A78BFA', '#FB7185', '#2DD4BF'];

export function ComparisonServiceSelector({ onSelectionsChange }: ComparisonServiceSelectorProps) {
    const [servicosSelecionados, setServicosSelecionados] = useState<ServicoSelecionado[]>([]);

    const [servicoPrincipalId, setServicoPrincipalId] = useState<string | null>(null);

    const [mostrarDisponiveis, setMostrarDisponiveis] = useState(false);

    const adicionarButtonRef = useRef<HTMLButtonElement>(null);
    const servicosPickerRef = useRef<HTMLDivElement>(null);

    const { services, isLoading, error } = useServices();

    const { regions, isLoading: regioesCarregando, error: erroRegioes } = useRegions();

    const servicosComDadosComparaveis = services.filter(
        (servico) =>
            servico.environmental?.energyKwh != null || servico.environmental?.co2eGrams != null,
    );

    useClickOutside(
        mostrarDisponiveis,
        adicionarButtonRef,
        servicosPickerRef,
        setMostrarDisponiveis,
    );

    // Envia os serviços selecionados e o serviço de referência
    // para a ComparisonPage.
    useEffect(() => {
        onSelectionsChange(
            servicosSelecionados.map((item) => ({
                selectionId: item.idSelecao,
                externalId: item.servico.id,
                name: item.servico.name,
                color: item.cor,
                simulatedRegion: item.regiaoSimulada,
            })),
            servicoPrincipalId,
        );
    }, [servicosSelecionados, servicoPrincipalId, onSelectionsChange]);

    // Adiciona um serviço à comparação.
    function adicionarServico(servico: ServiceSummary) {
        if (servicosSelecionados.length >= MAX_SERVICOS) {
            return;
        }

        const corDisponivel = CORES.find(
            (cor) => !servicosSelecionados.some((item) => item.cor === cor),
        );

        if (!corDisponivel) {
            return;
        }

        const novoServico: ServicoSelecionado = {
            idSelecao: crypto.randomUUID(),
            servico,
            cor: corDisponivel,
            regiaoSimulada: null,
        };

        setServicosSelecionados((atuais) => [...atuais, novoServico]);

        // O primeiro serviço adicionado se torna a referência.
        if (servicoPrincipalId === null) {
            setServicoPrincipalId(novoServico.idSelecao);
        }

        setMostrarDisponiveis(false);
    }

    // Remove um serviço da comparação.
    function removerServico(idSelecao: string) {
        const atualizados = servicosSelecionados.filter((item) => item.idSelecao !== idSelecao);

        setServicosSelecionados(atualizados);

        // Se o serviço removido era a referência,
        // o primeiro serviço restante assume essa posição.
        if (servicoPrincipalId === idSelecao) {
            setServicoPrincipalId(atualizados[0]?.idSelecao ?? null);
        }
    }

    // Altera a cor de um serviço.
    function alterarCor(idSelecao: string, novaCor: string) {
        setServicosSelecionados((atuais) => {
            const servicoAlvo = atuais.find((item) => item.idSelecao === idSelecao);

            if (!servicoAlvo || servicoAlvo.cor === novaCor) {
                return atuais;
            }

            const servicoComCorEscolhida = atuais.find(
                (item) => item.idSelecao !== idSelecao && item.cor === novaCor,
            );

            return atuais.map((item) => {
                if (item.idSelecao === idSelecao) {
                    return {
                        ...item,
                        cor: novaCor,
                    };
                }

                // Troca as cores caso outro serviço já utilize
                // a cor escolhida.
                if (servicoComCorEscolhida && item.idSelecao === servicoComCorEscolhida.idSelecao) {
                    return {
                        ...item,
                        cor: servicoAlvo.cor,
                    };
                }

                return item;
            });
        });
    }

    // Altera a região simulada de um serviço.
    function alterarRegiao(idSelecao: string, regiao: string | null) {
        setServicosSelecionados((atuais) =>
            atuais.map((item) =>
                item.idSelecao === idSelecao
                    ? {
                          ...item,
                          regiaoSimulada: regiao,
                      }
                    : item,
            ),
        );
    }

    return (
        <section className="space-y-4">
            {/* Título da área. */}
            <div>
                <h2 className="text-xl font-semibold text-slate-100">
                    Serviços selecionados{' '}
                    <span className="text-sm font-normal text-slate-400">
                        (máx. {MAX_SERVICOS})
                    </span>
                </h2>

                <p className="mt-1 text-sm text-slate-300">
                    Selecione os serviços que deseja comparar.
                </p>
            </div>

            {/* Grade dos serviços e botão de adicionar. */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {servicosSelecionados.map((item) => {
                    const id = item.idSelecao;

                    const coresUsadasPorOutros = servicosSelecionados
                        .filter((outro) => outro.idSelecao !== id)
                        .map((outro) => outro.cor);

                    const regioesDisponiveis = regions.filter(
                        (regiao) => regiao.code !== item.servico.location?.regionCode,
                    );

                    return (
                        <ComparisonServiceCard
                            key={id}
                            servico={item.servico}
                            principal={servicoPrincipalId === id}
                            cor={item.cor}
                            cores={CORES}
                            coresUsadasPorOutros={coresUsadasPorOutros}
                            regioes={regioesDisponiveis}
                            regioesCarregando={regioesCarregando}
                            erroRegioes={erroRegioes}
                            regiaoSimulada={item.regiaoSimulada}
                            onDefinirPrincipal={() => setServicoPrincipalId(id)}
                            onSelecionarCor={(cor) => alterarCor(id, cor)}
                            onConfirmarRegiao={(regiao) => alterarRegiao(id, regiao)}
                            onRemover={() => removerServico(id)}
                        />
                    );
                })}

                {/* Botão e catálogo de serviços. */}
                <div className="relative min-w-0">
                    <button
                        ref={adicionarButtonRef}
                        type="button"
                        disabled={servicosSelecionados.length >= MAX_SERVICOS}
                        aria-expanded={mostrarDisponiveis}
                        aria-controls="servicos-disponiveis"
                        onClick={() => setMostrarDisponiveis((atual) => !atual)}
                        className="flex min-h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-950/50 p-4 text-slate-400 transition-colors duration-200 hover:border-teal-400/60 hover:bg-slate-900 hover:text-teal-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Plus aria-hidden="true" className="size-7 text-teal-300" />

                        <span className="font-medium">Adicionar serviço</span>

                        <span className="text-xs text-slate-500">
                            {servicosSelecionados.length}/{MAX_SERVICOS} selecionados
                        </span>
                    </button>

                    {/* Catálogo flutuante de serviços. */}
                    {mostrarDisponiveis && servicosSelecionados.length < MAX_SERVICOS && (
                        <div
                            ref={servicosPickerRef}
                            id="servicos-disponiveis"
                            className="absolute left-0 top-full z-50 mt-2 max-h-[min(28rem,70vh)] w-[min(24rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-slate-700 bg-slate-950 p-2 text-slate-100 shadow-2xl shadow-black/40"
                        >
                            {isLoading ? (
                                <p className="px-3 py-4 text-sm text-muted-foreground">
                                    Carregando serviços...
                                </p>
                            ) : error && services.length === 0 ? (
                                <p className="px-3 py-4 text-sm text-red-400">
                                    Não foi possível carregar os serviços: {error}
                                </p>
                            ) : (
                                <AvailableServicesPicker
                                    servicos={servicosComDadosComparaveis}
                                    onAdicionar={adicionarServico}
                                    onFechar={() => setMostrarDisponiveis(false)}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
