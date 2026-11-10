import { ArrowDown, ArrowUp, Check, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { ranges } from '@/lib/metric-format';
import type { Dashboard, WidgetId } from '@/types/dashboard';
import { widgets } from './widgetCatalog';

interface DashboardEditorProps {
    draft: Dashboard;
    busy: boolean;
    dirty: boolean;
    onChange: (draft: Dashboard) => void;
    onSave: (event: FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
}

export function DashboardEditor({
    draft,
    busy,
    dirty,
    onChange,
    onSave,
    onCancel,
}: DashboardEditorProps) {
    const [category, setCategory] = useState('Todos');

    function moveWidget(index: number, direction: -1 | 1) {
        const next = [...draft.widgets];
        const target = index + direction;
        [next[index], next[target]] = [next[target], next[index]];
        onChange({ ...draft, widgets: next });
    }

    return (
        <form
            onSubmit={onSave}
            className="gs-card space-y-5"
            aria-labelledby="dashboard-editor-heading"
        >
            <fieldset disabled={busy} className="min-w-0 space-y-5">
                <legend id="dashboard-editor-heading" className="mb-4 text-lg font-semibold">
                    Personalizar painel
                </legend>
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem]">
                    <label>
                        Nome do painel
                        <input
                            required
                            maxLength={48}
                            value={draft.name}
                            onChange={(event) => onChange({ ...draft, name: event.target.value })}
                        />
                    </label>
                    <label>
                        <span id="dashboard-default-range-label">Período padrão</span>
                        <select
                            aria-labelledby="dashboard-default-range-label"
                            value={draft.range}
                            onChange={(event) =>
                                onChange({
                                    ...draft,
                                    range: event.target.value as Dashboard['range'],
                                })
                            }
                        >
                            {ranges.map((range) => (
                                <option key={range}>{range}</option>
                            ))}
                        </select>
                    </label>
                </div>
                <div className="grid min-w-0 gap-6 md:grid-cols-2">
                    <section aria-labelledby="dashboard-widgets">
                        <h3 className="font-semibold" id="dashboard-widgets">
                            Widgets do painel
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Organize a ordem em que aparecem abaixo do resumo de impacto.
                        </p>
                        <ul
                            className="mt-3 divide-y divide-border border-y border-border"
                            aria-label="Ordem dos widgets"
                        >
                            {draft.widgets.map((id, index) => (
                                <li
                                    key={id}
                                    className="flex min-w-0 flex-wrap items-center justify-between gap-2 py-2"
                                >
                                    <span className="text-sm">{widgets[id].name}</span>
                                    <div className="flex shrink-0 gap-1">
                                        <button
                                            className="gs-icon"
                                            type="button"
                                            disabled={index === 0}
                                            aria-label={'Subir ' + widgets[id].name}
                                            onClick={() => moveWidget(index, -1)}
                                        >
                                            <ArrowUp size={16} aria-hidden="true" />
                                        </button>
                                        <button
                                            className="gs-icon"
                                            type="button"
                                            disabled={index === draft.widgets.length - 1}
                                            aria-label={'Descer ' + widgets[id].name}
                                            onClick={() => moveWidget(index, 1)}
                                        >
                                            <ArrowDown size={16} aria-hidden="true" />
                                        </button>
                                        <button
                                            className="gs-icon"
                                            type="button"
                                            aria-label={'Remover ' + widgets[id].name}
                                            onClick={() =>
                                                onChange({
                                                    ...draft,
                                                    widgets: draft.widgets.filter(
                                                        (widget) => widget !== id,
                                                    ),
                                                })
                                            }
                                        >
                                            <X size={16} aria-hidden="true" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        {!draft.widgets.length && (
                            <p className="mt-2 text-sm text-muted-foreground">
                                Escolha um widget no catálogo.
                            </p>
                        )}
                    </section>
                    <section aria-labelledby="dashboard-catalog">
                        <h3 className="font-semibold" id="dashboard-catalog">
                            Catálogo de widgets
                        </h3>
                        <label className="mt-3">
                            <span id="dashboard-catalog-category">Categoria</span>
                            <select
                                aria-labelledby="dashboard-catalog-category"
                                value={category}
                                onChange={(event) => setCategory(event.target.value)}
                            >
                                {[
                                    'Todos',
                                    'Gráficos',
                                    'Impacto',
                                    'Recursos',
                                    'Operação',
                                    'Análise',
                                ].map((group) => (
                                    <option key={group}>{group}</option>
                                ))}
                            </select>
                        </label>
                        <ul
                            className="gs-catalog-list mt-3"
                            aria-label="Widgets disponíveis"
                            tabIndex={0}
                        >
                            {(Object.keys(widgets) as WidgetId[])
                                .filter(
                                    (id) => category === 'Todos' || widgets[id].group === category,
                                )
                                .map((id) => {
                                    const widget = widgets[id];
                                    const added = draft.widgets.includes(id);
                                    return (
                                        <li key={id} className="gs-catalog-item">
                                            <div>
                                                <strong className="text-sm">{widget.name}</strong>
                                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                                    {widget.description}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                className="gs-button gs-small"
                                                disabled={added}
                                                aria-label={
                                                    added
                                                        ? widget.name + ' adicionado'
                                                        : 'Adicionar ' + widget.name
                                                }
                                                onClick={() =>
                                                    onChange({
                                                        ...draft,
                                                        widgets: [...draft.widgets, id],
                                                    })
                                                }
                                            >
                                                {added ? 'Adicionado' : 'Adicionar'}
                                            </button>
                                        </li>
                                    );
                                })}
                        </ul>
                    </section>
                </div>
            </fieldset>

            <footer className="sticky bottom-0 flex flex-wrap items-center justify-between gap-2 border-t border-border bg-[#141c2c] py-3">
                <p role="status" className="text-sm text-muted-foreground">
                    {dirty ? 'Alterações pendentes' : 'Painel salvo'}
                </p>
                <div className="flex flex-wrap gap-2">
                    <button type="button" className="gs-button" disabled={busy} onClick={onCancel}>
                        {dirty ? 'Cancelar' : 'Voltar ao painel'}
                    </button>
                    <button
                        type="submit"
                        className="gs-button gs-primary"
                        disabled={busy || !dirty}
                    >
                        <Check size={16} aria-hidden="true" />{' '}
                        {busy ? 'Salvando…' : 'Salvar painel'}
                    </button>
                </div>
            </footer>
        </form>
    );
}
