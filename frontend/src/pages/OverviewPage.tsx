import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Plus, SlidersHorizontal } from 'lucide-react';
import { fetchDashboardMetrics, fetchDashboards, saveDashboard } from '@/api/dashboards';
import { errorMessage } from '@/api/authenticated';
import { DashboardEditor } from '@/components/overview/DashboardEditor';
import { OverviewImpact } from '@/components/overview/OverviewImpact';
import { WidgetValue } from '@/components/overview/WidgetValue';
import { templates, widgets } from '@/components/overview/widgetCatalog';
import { PageHeader } from '@/components/shared/PageHeader';
import { useAccountSession } from '@/contexts/auth';
import { useApiQuery } from '@/hooks/useApiQuery';
import { ranges } from '@/lib/metric-format';
import type { Dashboard, DashboardDraft } from '@/types/dashboard';
import type { HistoryRange } from '@/types/service';

export function OverviewPage() {
    const { session } = useAccountSession();
    const token = session.token;
    const [list, setList] = useState<Dashboard[]>([]);
    const [selectedId, setSelectedId] = useState('');
    const [draft, setDraft] = useState<Dashboard | null>(null);
    const [viewRange, setViewRange] = useState<HistoryRange | null>(null);
    const [creating, setCreating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [template, setTemplate] = useState(0);
    const [name, setName] = useState('');
    const editorRef = useRef<HTMLDivElement>(null);

    const selected = list.find((item) => item.id === selectedId);
    const panel = draft ?? selected;
    const range = draft?.range ?? viewRange ?? selected?.range ?? '24h';
    const editing = draft !== null;
    const dirty = Boolean(
        draft &&
        selected &&
        (draft.name !== selected.name ||
            draft.range !== selected.range ||
            draft.widgets.length !== selected.widgets.length ||
            draft.widgets.some((id, index) => id !== selected.widgets[index])),
    );
    const pending = dirty || (creating && (name.trim().length > 0 || template !== 0));

    const load = useCallback(() => fetchDashboardMetrics(range, token), [range, token]);
    const { data, error: metricsError } = useApiQuery(load);
    const snapshot = data?.range === range ? data : null;

    useEffect(() => {
        const controller = new AbortController();
        fetchDashboards(token, controller.signal)
            .then((dashboards) => {
                if (!controller.signal.aborted) {
                    setList(dashboards);
                    setSelectedId(dashboards[0]?.id ?? '');
                }
            })
            .catch((failure: unknown) => {
                if (!controller.signal.aborted) setError(errorMessage(failure));
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [token]);

    useEffect(() => {
        if (editing || creating) editorRef.current?.focus();
    }, [editing, creating]);

    useEffect(() => {
        if (!pending) return;
        function warnBeforeLeaving(event: BeforeUnloadEvent) {
            event.preventDefault();
        }
        window.addEventListener('beforeunload', warnBeforeLeaving);
        return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
    }, [pending]);

    function closeEditor() {
        if (pending && !window.confirm('Descartar as alterações pendentes?')) return false;
        setDraft(null);
        setCreating(false);
        setError('');
        setMessage('');
        return true;
    }

    function selectPanel(id: string) {
        if (!closeEditor()) return;
        setSelectedId(id);
        setViewRange(null);
    }

    function openCreate() {
        if (!closeEditor()) return;
        setCreating(true);
        setTemplate(0);
        setName('');
    }

    function openEditor() {
        if (!selected || !closeEditor()) return;
        setDraft(selected);
    }

    async function persist(body: DashboardDraft, id?: string) {
        setBusy(true);
        setError('');
        setMessage('');
        try {
            const result = await saveDashboard(body, token, id);
            setList((current) =>
                id ? current.map((item) => (item.id === id ? result : item)) : [...current, result],
            );
            setSelectedId(result.id);
            setDraft(null);
            setCreating(false);
            setViewRange(null);
            setMessage(id ? 'Painel salvo.' : 'Painel criado.');
        } catch (failure) {
            setError(errorMessage(failure));
        } finally {
            setBusy(false);
        }
    }

    function create(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const model = templates[template];
        void persist({ name: name.trim() || model.name, range: '24h', widgets: model.widgets });
    }

    function save(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!draft || !dirty) return;
        const { id, ...body } = draft;
        void persist(body, id);
    }

    return (
        <div className="greener-sprint">
            <main className="gs-overview-shell">
                <PageHeader
                    title="Visão geral"
                    description="Acompanhe o consumo de energia e as emissões estimadas dos serviços."
                />
                <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
                    <div className="flex w-full min-w-0 items-end gap-3 sm:w-auto">
                        {!!list.length && (
                            <label className="min-w-0 flex-1 sm:min-w-48 sm:max-w-72">
                                <span id="overview-panel-label">Painel</span>
                                <select
                                    aria-labelledby="overview-panel-label"
                                    value={selectedId}
                                    disabled={busy}
                                    onChange={(event) => selectPanel(event.target.value)}
                                >
                                    {list.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        )}
                        {!editing && !creating && (
                            <label className="w-24 shrink-0">
                                <span id="overview-range-label">Período</span>
                                <select
                                    aria-labelledby="overview-range-label"
                                    value={range}
                                    onChange={(event) =>
                                        setViewRange(event.target.value as HistoryRange)
                                    }
                                >
                                    {ranges.map((period) => (
                                        <option key={period}>{period}</option>
                                    ))}
                                </select>
                            </label>
                        )}
                    </div>
                    {!editing && !creating && (
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                className="gs-button max-[359px]:px-2! max-[359px]:text-xs!"
                                disabled={loading}
                                onClick={openCreate}
                            >
                                <Plus size={16} aria-hidden="true" /> Novo painel
                            </button>
                            {selected && (
                                <button
                                    type="button"
                                    className="gs-button gs-primary max-[359px]:px-2! max-[359px]:text-xs!"
                                    onClick={openEditor}
                                >
                                    <SlidersHorizontal size={16} aria-hidden="true" /> Personalizar
                                    painel
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {error && (
                    <p className="gs-error" role="alert">
                        {error}
                    </p>
                )}
                {message && (
                    <p className="gs-notice" role="status">
                        {message}
                    </p>
                )}
                {metricsError && snapshot && (
                    <p className="gs-error" role="alert">
                        Falha ao atualizar as métricas. Exibindo a última consulta disponível.
                    </p>
                )}

                {editing || creating ? (
                    <div
                        ref={editorRef}
                        tabIndex={-1}
                        className="min-w-0 scroll-mt-24 sm:scroll-mt-28"
                    >
                        {draft ? (
                            <DashboardEditor
                                draft={draft}
                                busy={busy}
                                dirty={dirty}
                                onChange={setDraft}
                                onSave={save}
                                onCancel={closeEditor}
                            />
                        ) : (
                            <form
                                onSubmit={create}
                                className="gs-card space-y-4"
                                aria-labelledby="create-dashboard-heading"
                            >
                                <h2 id="create-dashboard-heading">Criar painel</h2>
                                <label>
                                    Nome do painel
                                    <input
                                        maxLength={48}
                                        placeholder="Ex.: Infra de produção"
                                        value={name}
                                        onChange={(event) => setName(event.target.value)}
                                    />
                                </label>
                                <fieldset className="grid gap-2" disabled={busy}>
                                    <legend className="mb-2 text-sm font-semibold">
                                        Modelo inicial
                                    </legend>
                                    {templates.map((model, index) => (
                                        <label className="gs-choice" key={model.name}>
                                            <input
                                                type="radio"
                                                name="template"
                                                checked={template === index}
                                                onChange={() => setTemplate(index)}
                                            />
                                            <span>
                                                <strong>{model.name}</strong>
                                                <small>{model.description}</small>
                                            </span>
                                        </label>
                                    ))}
                                </fieldset>
                                <div className="flex gap-2">
                                    <button className="gs-button gs-primary" disabled={busy}>
                                        {busy ? 'Criando…' : 'Criar painel'}
                                    </button>
                                    <button
                                        className="gs-button"
                                        type="button"
                                        disabled={busy}
                                        onClick={closeEditor}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                ) : (
                    <OverviewImpact snapshot={snapshot} unavailable={Boolean(metricsError)} />
                )}

                {!creating && panel && (
                    <section
                        className="@container min-w-0 space-y-3"
                        aria-labelledby="overview-widgets"
                    >
                        <h2 className="text-lg font-semibold" id="overview-widgets">
                            {editing ? 'Prévia dos widgets' : 'Widgets do painel'}
                        </h2>
                        {panel.widgets.length ? (
                            <div className="gs-widget-grid">
                                {panel.widgets.map((id) => (
                                    <article
                                        key={id}
                                        className={
                                            'gs-card min-w-0 ' +
                                            (widgets[id].group === 'Gráficos' || id === 'comparison'
                                                ? 'gs-widget-wide'
                                                : '')
                                        }
                                    >
                                        <h3 className="font-semibold">{widgets[id].name}</h3>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {widgets[id].description}
                                        </p>
                                        <div className="mt-4">
                                            {snapshot ? (
                                                <WidgetValue id={id} snapshot={snapshot} />
                                            ) : (
                                                <p className="text-sm text-muted-foreground">
                                                    {metricsError
                                                        ? 'Métricas indisponíveis.'
                                                        : 'Carregando métricas…'}
                                                </p>
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                {editing
                                    ? 'A prévia aparece ao adicionar um widget.'
                                    : 'Use Personalizar painel para escolher seus widgets.'}
                            </p>
                        )}
                    </section>
                )}
                {!panel && !creating && !loading && (
                    <p className="text-sm text-muted-foreground">
                        Crie um painel para reunir seus indicadores e gráficos favoritos.
                    </p>
                )}
            </main>
        </div>
    );
}
