import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { CollectionStatusPanel } from '@/components/services/CollectionStatusPanel';
import { ServiceFilters } from '@/components/services/ServiceFilters';
import { ServiceList } from '@/components/services/ServiceList';
import { StatusLegend } from '@/components/services/StatusLegend';
import { PageHeader } from '@/components/shared/PageHeader';
import { PageShell } from '@/components/shared/PageShell';
import {
    defaultFilters,
    filterServices,
    listCountries,
} from '@/components/services/filterServices';
import { useServices } from '@/hooks/useServices';

export function DashboardPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const collectionView = searchParams.get('visao') === 'coletas';

    const { services, isLoading, error } = useServices();

    const [filters, setFilters] = useState(defaultFilters);

    const countries = useMemo(() => listCountries(services), [services]);

    const visibleServices = useMemo(() => filterServices(services, filters), [services, filters]);

    return (
        <PageShell>
            <PageHeader
                title="Serviços"
                description="Estado, localização, métricas e impacto estimado de cada serviço."
            />

            <nav
                aria-label="Visualização dos serviços"
                className="flex gap-2 border-b border-border pb-3"
            >
                {[
                    { label: 'Métricas dos serviços', value: 'metricas' },
                    { label: 'Status de coleta', value: 'coletas' },
                ].map((tab) => {
                    const active = (collectionView ? 'coletas' : 'metricas') === tab.value;

                    return (
                        <button
                            key={tab.value}
                            type="button"
                            aria-current={active ? 'page' : undefined}
                            onClick={() =>
                                setSearchParams((previous) => {
                                    const next = new URLSearchParams(previous);
                                    next.set('visao', tab.value);
                                    return next;
                                })
                            }
                            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                                active
                                    ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                                    : 'border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground'
                            }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </nav>

            {collectionView ? (
                <CollectionStatusPanel />
            ) : (
                <div className="space-y-5">
                    {isLoading && <p className="text-muted-foreground">Carregando serviços...</p>}

                    {error && <p className="text-destructive">{error}</p>}

                    {!isLoading && !error && (
                        <>
                            <ServiceFilters
                                filters={filters}
                                countries={countries}
                                onChange={setFilters}
                            />

                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="tabular-nums">{visibleServices.length}</span>
                                    <span>de {services.length} serviços</span>
                                </div>

                                <p className="text-xs text-muted-foreground">
                                    Energia e CO₂e referentes à última coleta
                                </p>
                            </div>

                            {visibleServices.length === 0 ? (
                                <div className="rounded-xl border border-white/10 bg-card px-4 py-10 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Nenhum serviço encontrado com esses filtros.
                                    </p>
                                </div>
                            ) : (
                                <ServiceList services={visibleServices} />
                            )}

                            <StatusLegend />
                        </>
                    )}
                </div>
            )}
        </PageShell>
    );
}
