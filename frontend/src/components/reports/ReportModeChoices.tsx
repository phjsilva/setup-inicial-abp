import { ChartColumn, ChartNoAxesCombined, Table2 } from 'lucide-react';
import type { Visualization } from '@/types/report';

const modes = {
    line: {
        label: 'Linha',
        description: 'Acompanhe a evolução no período.',
        icon: ChartNoAxesCombined,
    },
    bars: {
        label: 'Barras',
        description: 'Compare os valores de cada serviço.',
        icon: ChartColumn,
    },
    table: { label: 'Tabela', description: 'Consulte os valores lado a lado.', icon: Table2 },
};

export function ReportModeChoices({
    value,
    onChange,
    disabled,
}: {
    value: Visualization;
    onChange: (mode: Visualization) => void;
    disabled: boolean;
}) {
    return (
        <fieldset className="gs-mode-options" disabled={disabled}>
            <legend>Tipo de visualização</legend>
            {(Object.keys(modes) as Visualization[]).map((mode) => {
                const { label, description, icon: Icon } = modes[mode];
                return (
                    <label className="gs-choice gs-mode-choice" key={mode}>
                        <input
                            type="radio"
                            name="visualization"
                            checked={value === mode}
                            onChange={() => onChange(mode)}
                        />
                        <Icon size={19} aria-hidden="true" />
                        <span>
                            <strong>{label}</strong>
                            <small>{description}</small>
                        </span>
                    </label>
                );
            })}
        </fieldset>
    );
}
