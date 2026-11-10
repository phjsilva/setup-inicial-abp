import { Server } from 'lucide-react';
import type { ServiceSummary } from '@/types/service';

interface AvailableServicesPickerProps {
    servicos: ServiceSummary[];
    onAdicionar: (servico: ServiceSummary) => void;
    onFechar: () => void;
}

export function AvailableServicesPicker({ servicos, onAdicionar }: AvailableServicesPickerProps) {
    return (
        <div className="w-full min-w-0 space-y-2">
            <h3 className="px-2 py-1 text-sm font-semibold text-foreground">Adicionar serviço</h3>

            <div className="flex flex-col gap-1">
                {servicos.map((servico) => {
                    const local =
                        servico.location?.city ??
                        servico.location?.region ??
                        'Região não informada';

                    return (
                        <button
                            key={servico.id}
                            type="button"
                            onClick={() => onAdicionar(servico)}
                            className="flex w-full min-w-0 items-center gap-3 rounded-lg border border-transparent px-3 py-3 text-left transition-colors hover:border-teal-500/30 hover:bg-teal-500/10"
                        >
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary">
                                <Server aria-hidden="true" className="size-4 text-teal-400" />
                            </span>

                            <span className="min-w-0 flex-1">
                                <span
                                    title={servico.name}
                                    className="block truncate whitespace-nowrap text-sm font-medium text-foreground"
                                >
                                    {servico.name}
                                </span>

                                <span
                                    title={local}
                                    className="mt-1 block truncate whitespace-nowrap text-xs text-muted-foreground"
                                >
                                    {local}
                                </span>
                            </span>

                            <span className="shrink-0 text-xs text-teal-400">Adicionar</span>
                        </button>
                    );
                })}

                {servicos.length === 0 && (
                    <p className="px-3 py-4 text-sm text-muted-foreground">
                        Nenhum serviço com métricas disponíveis.
                    </p>
                )}
            </div>
        </div>
    );
}
