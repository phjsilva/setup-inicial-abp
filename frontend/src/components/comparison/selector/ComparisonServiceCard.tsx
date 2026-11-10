import { useRef, useState } from 'react';

import { ChevronDown, MapPin, MapPinned, Server, Star, X } from 'lucide-react';

import type { ServiceSummary } from '@/types/service';
import type { Region } from '@/types/api';

import { useClickOutside } from '@/hooks/useClickOutside';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ComparisonColorPicker } from './ComparisonColorPicker';
import { ComparisonRegionPicker } from './ComparisonRegionPicker';

interface ComparisonServiceCardProps {
    servico: ServiceSummary;
    principal: boolean;
    cor: string;
    cores: string[];
    coresUsadasPorOutros: string[];
    regioes: Region[];
    regioesCarregando: boolean;
    erroRegioes: string | null;
    regiaoSimulada: string | null;
    onDefinirPrincipal: () => void;
    onSelecionarCor: (cor: string) => void;
    onConfirmarRegiao: (regiao: string | null) => void;
    onRemover: () => void;
}

export function ComparisonServiceCard({
    servico,
    principal,
    cor,
    cores,
    coresUsadasPorOutros,
    regioes,
    regioesCarregando,
    erroRegioes,
    regiaoSimulada,
    onDefinirPrincipal,
    onSelecionarCor,
    onConfirmarRegiao,
    onRemover,
}: ComparisonServiceCardProps) {
    const [mostrarCores, setMostrarCores] = useState(false);
    const [mostrarRegioes, setMostrarRegioes] = useState(false);

    const corButtonRef = useRef<HTMLButtonElement>(null);
    const corPickerRef = useRef<HTMLDivElement>(null);

    const regiaoButtonRef = useRef<HTMLButtonElement>(null);
    const regiaoPickerRef = useRef<HTMLDivElement>(null);

    useClickOutside(mostrarCores, corButtonRef, corPickerRef, setMostrarCores);

    useClickOutside(mostrarRegioes, regiaoButtonRef, regiaoPickerRef, setMostrarRegioes);

    const regiaoOriginal = servico.location?.city ?? servico.location?.region ?? null;

    const regiaoSelecionada = regioes.find((regiao) => regiao.code === regiaoSimulada);

    const nomeRegiao =
        regiaoSimulada === null
            ? regiaoOriginal
            : (regiaoSelecionada?.city ?? regiaoSelecionada?.region ?? 'Região não encontrada');

    const statusTexto =
        servico.active === undefined ? 'Status desconhecido' : servico.active ? 'Ativo' : 'Inativo';

    const statusCor =
        servico.active === undefined
            ? 'bg-slate-500'
            : servico.active
              ? 'bg-emerald-500'
              : 'bg-red-500';

    return (
        <div className="space-y-2">
            <div className="relative min-w-0">
                <Card className="min-w-0 gap-0">
                    <CardContent className="space-y-3 pb-4">
                        <div className="flex items-start gap-3">
                            <div
                                className="flex size-11 shrink-0 items-center justify-center rounded-full"
                                style={{ backgroundColor: cor }}
                            >
                                <Server aria-hidden="true" className="size-5 text-white" />
                            </div>

                            <div className="min-w-0 flex-1 space-y-2">
                                {/* Nome e serviço de referência. */}
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex min-w-0 items-start gap-1">
                                        <button
                                            type="button"
                                            onClick={onDefinirPrincipal}
                                            aria-label={
                                                principal
                                                    ? `${servico.name} é o serviço de referência`
                                                    : `Definir ${servico.name} como referência`
                                            }
                                            title="Definir serviço de referência"
                                            className="shrink-0 rounded p-0.5 transition-colors hover:bg-slate-800"
                                        >
                                            <Star
                                                aria-hidden="true"
                                                className={`size-4 transition-colors ${
                                                    principal
                                                        ? 'fill-teal-400 text-teal-400'
                                                        : 'text-slate-400 hover:text-teal-300'
                                                }`}
                                            />
                                        </button>

                                        <h3
                                            className="break-words text-sm font-semibold text-slate-100"
                                            title={servico.name}
                                        >
                                            {servico.name}
                                        </h3>
                                    </div>

                                    {principal && (
                                        <span className="shrink-0 rounded-full border border-teal-400/50 bg-teal-400/10 px-2 py-0.5 text-xs font-medium text-teal-300">
                                            Referência
                                        </span>
                                    )}
                                </div>

                                {/* Região atual. */}
                                <div className="flex flex-wrap items-center gap-1.5 text-sm">
                                    <MapPin
                                        aria-hidden="true"
                                        className="size-4 shrink-0 text-slate-400"
                                    />

                                    {nomeRegiao ? (
                                        <>
                                            <span className="text-slate-300">{nomeRegiao}</span>

                                            {regiaoSimulada !== null ? (
                                                <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-xs text-amber-400">
                                                    Simulada
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-500">
                                                    (original)
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-slate-400">Região não informada</span>
                                    )}
                                </div>

                                {/* Status. */}
                                <div className="flex items-center gap-2 text-sm">
                                    <span
                                        aria-hidden="true"
                                        className={`size-2.5 shrink-0 rounded-full ${statusCor}`}
                                    />

                                    <span className="text-slate-300">{statusTexto}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>

                    {/* A única divisória, integrada ao rodapé. */}
                    <CardFooter className="relative flex items-center gap-3 border-t-0 px-6 pb-4 pt-3 before:absolute before:left-6 before:right-6 before:top-0 before:h-px before:bg-border/70">
                        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2">
                            {/* Botão de cor. */}
                            <button
                                ref={corButtonRef}
                                type="button"
                                onClick={() => setMostrarCores((atual) => !atual)}
                                aria-expanded={mostrarCores}
                                className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-teal-300"
                            >
                                <span
                                    className="size-6 shrink-0 rounded-full border border-slate-700"
                                    style={{ backgroundColor: cor }}
                                />

                                <span>Cor</span>

                                <ChevronDown
                                    aria-hidden="true"
                                    className={`size-4 transition-transform ${
                                        mostrarCores ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>

                            {/* Botão de região. */}
                            <button
                                ref={regiaoButtonRef}
                                type="button"
                                onClick={() => setMostrarRegioes((atual) => !atual)}
                                aria-expanded={mostrarRegioes}
                                className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-teal-300"
                            >
                                <MapPinned aria-hidden="true" className="size-4 shrink-0" />

                                <span>Simular região</span>

                                <ChevronDown
                                    aria-hidden="true"
                                    className={`size-4 transition-transform ${
                                        mostrarRegioes ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Remover serviço. */}
                        <button
                            type="button"
                            onClick={onRemover}
                            aria-label={`Remover ${servico.name} da comparação`}
                            title="Remover serviço"
                            className="ml-auto shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-red-400"
                        >
                            <X aria-hidden="true" className="size-4" />
                        </button>
                    </CardFooter>
                </Card>

                {/* Seletor de cores flutuante. */}
                {mostrarCores && (
                    <div
                        ref={corPickerRef}
                        className="absolute left-0 top-full z-50 mt-2 w-56 max-w-[calc(100vw-2rem)] shadow-xl shadow-black/30"
                    >
                        <ComparisonColorPicker
                            cores={cores}
                            corAtual={cor}
                            coresUsadasPorOutros={coresUsadasPorOutros}
                            onSelecionarCor={onSelecionarCor}
                            onFechar={() => setMostrarCores(false)}
                        />
                    </div>
                )}

                {/* Seletor de regiões flutuante. */}
                {mostrarRegioes && (
                    <div
                        ref={regiaoPickerRef}
                        className="absolute right-0 top-full z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] shadow-xl shadow-black/30"
                    >
                        <ComparisonRegionPicker
                            regioes={regioes}
                            regiaoAtual={regiaoSimulada}
                            regioesCarregando={regioesCarregando}
                            erroRegioes={erroRegioes}
                            onSelecionarRegiao={onConfirmarRegiao}
                            onFechar={() => setMostrarRegioes(false)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
