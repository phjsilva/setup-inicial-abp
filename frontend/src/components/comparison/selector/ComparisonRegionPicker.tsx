import type { Region } from '@/types/api';

interface ComparisonRegionPickerProps {
    regioes: Region[];
    regiaoAtual: string | null;
    regioesCarregando: boolean;
    erroRegioes: string | null;
    onSelecionarRegiao: (regiao: string | null) => void;
    onFechar: () => void;
}

export function ComparisonRegionPicker({
    regioes,
    regiaoAtual,
    regioesCarregando,
    erroRegioes,
    onSelecionarRegiao,
    onFechar,
}: ComparisonRegionPickerProps) {
    return (
        <div className="rounded-lg border border-border bg-background p-2">
            <div className="flex flex-col gap-1">
                {/* Utilizar a região original do serviço. */}
                <button
                    type="button"
                    onClick={() => {
                        onSelecionarRegiao(null);
                        onFechar();
                    }}
                    aria-pressed={regiaoAtual === null}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-secondary ${
                        regiaoAtual === null ? 'bg-secondary' : ''
                    }`}
                >
                    <span className="flex-1">Usar região original</span>
                </button>

                {/* Estados de carregamento e erro. */}
                {regioesCarregando ? (
                    <p className="px-3 py-3 text-sm text-muted-foreground">Carregando regiões...</p>
                ) : erroRegioes && regioes.length === 0 ? (
                    <p className="px-3 py-3 text-sm text-red-400">
                        Não foi possível carregar as regiões: {erroRegioes}
                    </p>
                ) : regioes.length === 0 ? (
                    <p className="px-3 py-3 text-sm text-muted-foreground">
                        Nenhuma região cadastrada.
                    </p>
                ) : (
                    /* Lista de regiões recebidas da API. */
                    regioes.map((regiao) => {
                        const selecionada = regiao.code === regiaoAtual;

                        return (
                            <button
                                key={regiao.code}
                                type="button"
                                onClick={() => {
                                    onSelecionarRegiao(regiao.code);
                                    onFechar();
                                }}
                                aria-pressed={selecionada}
                                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-secondary ${
                                    selecionada ? 'bg-secondary' : ''
                                }`}
                            >
                                <span className="flex flex-1 flex-col">
                                    <span className="font-medium">
                                        {regiao.city ?? regiao.region}
                                    </span>

                                    <span className="text-xs text-muted-foreground">
                                        {regiao.country}
                                    </span>
                                </span>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
