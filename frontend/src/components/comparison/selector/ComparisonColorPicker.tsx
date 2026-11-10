interface ComparisonColorPickerProps {
    cores: string[];
    corAtual: string;
    coresUsadasPorOutros: string[];
    onSelecionarCor: (cor: string) => void;
    onFechar: () => void;
}

const NOMES_CORES: Record<string, string> = {
    '#60A5FA': 'Azul',
    '#34D399': 'Verde',
    '#A78BFA': 'Roxo',
    '#FB7185': 'Rosa',
    '#2DD4BF': 'Turquesa',
};

export function ComparisonColorPicker({
    cores,
    corAtual,
    coresUsadasPorOutros,
    onSelecionarCor,
    onFechar,
}: ComparisonColorPickerProps) {
    return (
        <div className="rounded-lg border border-border bg-background p-2">
            <div className="flex flex-col gap-1">
                {cores.map((cor) => {
                    const selecionada = cor === corAtual;
                    const emUso = coresUsadasPorOutros.includes(cor);

                    return (
                        <button
                            key={cor}
                            type="button"
                            onClick={() => {
                                onSelecionarCor(cor);
                                onFechar();
                            }}
                            aria-label={`Selecionar cor ${NOMES_CORES[cor] ?? cor}${
                                emUso ? ', atualmente usada por outro serviço' : ''
                            }`}
                            aria-pressed={selecionada}
                            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-secondary ${
                                selecionada ? 'bg-secondary' : ''
                            }`}
                        >
                            <span
                                className={`size-5 shrink-0 rounded-full border border-border ${
                                    selecionada
                                        ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background'
                                        : ''
                                }`}
                                style={{ backgroundColor: cor }}
                            />

                            <span>{NOMES_CORES[cor] ?? cor}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
