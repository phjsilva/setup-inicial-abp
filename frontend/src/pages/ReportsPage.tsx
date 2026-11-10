import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ChevronDown, Download } from 'lucide-react';
import { downloadReport, previewReport } from '@/api/reports';
import { errorMessage } from '@/api/authenticated';
import type { Report, ReportFilters, ReportMetric, Visualization } from '@/types/report';
import { ReportModeChoices } from '@/components/reports/ReportModeChoices';
import { ReportPreview } from '@/components/reports/ReportPreview';
import { fetchServices } from '@/api/services';
import { ranges } from '@/lib/metric-format';
import { reportMetrics } from '@/components/reports/reportMetrics';
import { PageHeader } from '@/components/shared/PageHeader';
import { PageShell } from '@/components/shared/PageShell';
import { useAccountSession } from '@/contexts/auth';
import type { ServiceSummary } from '@/types/service';

export function ReportsPage() {
    const { session } = useAccountSession();
    const [services, setServices] = useState<ServiceSummary[] | null>(null);
    const [serviceError, setServiceError] = useState('');
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState<ReportFilters>({
        serviceIds: [],
        range: '24h',
        metrics: ['energy', 'carbon'],
        visualization: 'line',
    });
    const [report, setReport] = useState<Report | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const reviewing = report !== null;
    const stepHeading = useRef<HTMLHeadingElement>(null);
    const wasReviewing = useRef(false);

    useEffect(() => {
        if (reviewing !== wasReviewing.current) stepHeading.current?.focus();
        wasReviewing.current = reviewing;
    }, [reviewing]);
    const matchingServices = services?.filter((service) =>
        service.name.toLocaleLowerCase('pt-BR').includes(search.trim().toLocaleLowerCase('pt-BR')),
    );
    const remaining = 20 - filters.serviceIds.length;
    const selectable =
        matchingServices?.filter((service) => !filters.serviceIds.includes(service.id)) ?? [];

    function selectMatching() {
        const ids = selectable.slice(0, remaining).map((service) => service.id);
        setFilters({ ...filters, serviceIds: [...filters.serviceIds, ...ids] });
    }

    function changeMode(visualization: Visualization) {
        setFilters({ ...filters, visualization });
    }

    useEffect(() => {
        let active = true;
        fetchServices({ active: true })
            .then((data) => {
                if (active) setServices(data);
            })
            .catch((failure: unknown) => {
                if (active) setServiceError(errorMessage(failure));
            });
        return () => {
            active = false;
        };
    }, []);

    function toggleMetric(key: ReportMetric) {
        const metrics = filters.metrics.includes(key)
            ? filters.metrics.filter((metric) => metric !== key)
            : [...filters.metrics, key];
        setFilters({ ...filters, metrics });
    }

    function toggleService(id: string) {
        const serviceIds = filters.serviceIds.includes(id)
            ? filters.serviceIds.filter((key) => key !== id)
            : [...filters.serviceIds, id];
        setFilters({ ...filters, serviceIds });
    }

    async function preview(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');
        if (!filters.serviceIds.length || !filters.metrics.length) {
            setError('Selecione pelo menos um serviço e uma métrica.');
            return;
        }
        setBusy(true);
        try {
            setReport(await previewReport(filters, session.token));
        } catch (failure) {
            setError(errorMessage(failure));
        } finally {
            setBusy(false);
        }
    }

    function editSelection() {
        setReport(null);
        setError('');
    }

    async function exportPdf() {
        if (!report) return;
        setBusy(true);
        setError('');
        try {
            await downloadReport({ ...filters, end: report.end }, session.token);
        } catch (failure) {
            setError(errorMessage(failure));
        } finally {
            setBusy(false);
        }
    }

    const selectionDetails = (
        <dl className="gs-report-scope space-y-3 text-sm">
            <div>
                <dt className="text-xs text-muted-foreground">Serviços selecionados</dt>
                <dd>
                    {services
                        ?.filter((service) => filters.serviceIds.includes(service.id))
                        .map((service) => service.name)
                        .join(', ') || 'Selecione os serviços'}
                </dd>
            </div>
            <div>
                <dt className="text-xs text-muted-foreground">Métricas</dt>
                <dd>
                    {filters.metrics.map((key) => reportMetrics[key].label).join(', ') ||
                        'Selecione as métricas'}
                </dd>
            </div>
        </dl>
    );

    return (
        <div className="greener-sprint">
            <PageShell>
                <PageHeader
                    title="Relatórios"
                    description="Selecione os serviços e o período. Revise os dados antes de exportar o PDF."
                />
                <ol className="gs-steps" aria-label="Etapas do relatório">
                    <li aria-current={!reviewing ? 'step' : undefined}>Selecionar dados</li>
                    <li aria-current={reviewing ? 'step' : undefined}>Revisar e exportar</li>
                </ol>
                {serviceError && (
                    <p role="alert" className="gs-error">
                        {serviceError}
                    </p>
                )}
                <div className="gs-report-layout">
                    <div>
                        <aside
                            className="gs-card hidden space-y-3 min-[701px]:block"
                            aria-label="Resumo da seleção"
                        >
                            <h2>Resumo da seleção</h2>
                            <p className="text-sm text-muted-foreground">
                                {filters.serviceIds.length}/20 serviços · {filters.range}
                            </p>
                            {selectionDetails}
                        </aside>
                        <details className="group rounded-lg border border-border px-3 py-2.5 min-[701px]:hidden">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400">
                                <span>
                                    <span className="sr-only">Resumo da seleção. </span>
                                    {filters.serviceIds.length}/20 serviços · {filters.range}
                                </span>
                                <ChevronDown
                                    size={16}
                                    className="group-open:rotate-180"
                                    aria-hidden="true"
                                />
                            </summary>
                            <div className="pt-3">{selectionDetails}</div>
                        </details>
                    </div>
                    {!report ? (
                        <form className="gs-card min-w-0 space-y-4" onSubmit={preview}>
                            <h2 ref={stepHeading} tabIndex={-1} className="scroll-mt-24">
                                Selecionar dados
                            </h2>
                            <fieldset disabled={busy} className="min-w-0 space-y-4">
                                <label>
                                    <span>
                                        Título do relatório{' '}
                                        <span className="text-muted-foreground">(opcional)</span>
                                    </span>
                                    <input
                                        maxLength={100}
                                        placeholder="Ex.: Consumo da infraestrutura"
                                        value={filters.title ?? ''}
                                        onChange={(e) =>
                                            setFilters({ ...filters, title: e.target.value })
                                        }
                                    />
                                </label>
                                <label>
                                    Buscar serviço
                                    <input
                                        type="search"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </label>
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        className="gs-button gs-small"
                                        type="button"
                                        disabled={!remaining || !selectable.length}
                                        onClick={selectMatching}
                                    >
                                        Selecionar resultados
                                    </button>
                                    <button
                                        className="gs-button gs-small"
                                        type="button"
                                        disabled={!filters.serviceIds.length}
                                        onClick={() => setFilters({ ...filters, serviceIds: [] })}
                                    >
                                        Limpar seleção
                                    </button>
                                    <span className="gs-pill" aria-live="polite">
                                        {filters.serviceIds.length}/20 selecionados
                                    </span>
                                </div>
                                <fieldset className="gs-selection gs-service-selection">
                                    <legend>Serviços</legend>
                                    {services === null ? (
                                        <p className="text-sm text-muted-foreground">
                                            {serviceError
                                                ? 'Lista indisponível.'
                                                : 'Carregando serviços…'}
                                        </p>
                                    ) : services.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            Nenhum serviço ativo encontrado.
                                        </p>
                                    ) : !matchingServices?.length ? (
                                        <p className="text-sm text-muted-foreground">
                                            Nenhum resultado para essa busca.
                                        </p>
                                    ) : (
                                        matchingServices.map((service) => (
                                            <label className="gs-choice" key={service.id}>
                                                <input
                                                    type="checkbox"
                                                    checked={filters.serviceIds.includes(
                                                        service.id,
                                                    )}
                                                    disabled={
                                                        filters.serviceIds.length >= 20 &&
                                                        !filters.serviceIds.includes(service.id)
                                                    }
                                                    onChange={() => toggleService(service.id)}
                                                />
                                                {service.name}
                                            </label>
                                        ))
                                    )}
                                </fieldset>
                                <label className="max-w-52">
                                    Período
                                    <select
                                        value={filters.range}
                                        onChange={(e) =>
                                            setFilters({
                                                ...filters,
                                                range: e.target.value as ReportFilters['range'],
                                            })
                                        }
                                    >
                                        {ranges.map((range) => (
                                            <option key={range}>{range}</option>
                                        ))}
                                    </select>
                                </label>
                                <fieldset className="gs-selection">
                                    <legend>Métricas</legend>
                                    {(Object.keys(reportMetrics) as ReportMetric[]).map(
                                        (metric) => (
                                            <label className="gs-choice" key={metric}>
                                                <input
                                                    type="checkbox"
                                                    checked={filters.metrics.includes(metric)}
                                                    onChange={() => toggleMetric(metric)}
                                                />
                                                {reportMetrics[metric].label}
                                            </label>
                                        ),
                                    )}
                                </fieldset>
                                {error && (
                                    <p className="gs-error" role="alert">
                                        {error}
                                    </p>
                                )}
                                <button className="gs-button gs-primary">
                                    {busy ? 'Gerando prévia…' : 'Gerar prévia'}
                                </button>
                            </fieldset>
                        </form>
                    ) : (
                        <section className="gs-card min-w-0 space-y-4">
                            <header className="flex flex-wrap items-center justify-between gap-3">
                                <h2 ref={stepHeading} tabIndex={-1} className="scroll-mt-24">
                                    Revisar e exportar
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        className="gs-button"
                                        disabled={busy}
                                        onClick={editSelection}
                                    >
                                        Editar seleção
                                    </button>
                                    <button
                                        type="button"
                                        className="gs-button gs-primary"
                                        disabled={busy}
                                        onClick={() => void exportPdf()}
                                    >
                                        <Download size={16} aria-hidden="true" />
                                        {busy ? 'Exportando…' : 'Exportar PDF'}
                                    </button>
                                </div>
                            </header>
                            {error && (
                                <p className="gs-error" role="alert">
                                    {error}
                                </p>
                            )}
                            <ReportPreview
                                report={{ ...report, visualization: filters.visualization }}
                            >
                                <ReportModeChoices
                                    value={filters.visualization}
                                    onChange={changeMode}
                                    disabled={busy}
                                />
                            </ReportPreview>
                        </section>
                    )}
                </div>
            </PageShell>
        </div>
    );
}
