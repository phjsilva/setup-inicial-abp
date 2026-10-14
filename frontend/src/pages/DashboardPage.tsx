import { useMemo, useState } from 'react';
import { ServiceFilters } from '@/components/services/ServiceFilters';
import { ServiceList } from '@/components/services/ServiceList';
import {
    defaultFilters,
    filterServices,
    listCountries,
} from '@/components/services/filterServices';
import { useServices } from '@/hooks/useServices';

export function DashboardPage() {
    const [regionCode, setRegionCode] = useState('');
    const [active, setActive] = useState('all');
    const { services, isLoading, error } = useServices(
        regionCode || undefined,
        active === 'all' ? undefined : active === 'true',
    );
    const [filters, setFilters] = useState(defaultFilters);

    const countries = useMemo(() => listCountries(services), [services]);
    const visibleServices = useMemo(() => filterServices(services, filters), [services, filters]);

    return (
        <main className="mx-auto max-w-7xl space-y-6 p-6">
            <header>
                <h1 className="text-3xl font-semibold">Serviços</h1>
                <p className="text-muted-foreground">
                    Estado, localização, métricas e impacto estimado de cada serviço.
                </p>
            </header>
            <div className="flex flex-wrap gap-4">
                <label className="flex flex-col gap-1 text-sm">
                    Código da região
                    <input
                        className="rounded-md border bg-secondary px-3 py-2"
                        placeholder="Todas as regiões"
                        value={regionCode}
                        onChange={(event) => setRegionCode(event.target.value)}
                    />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                    Listagem
                    <select
                        className="rounded-md border bg-secondary px-3 py-2"
                        value={active}
                        onChange={(event) => setActive(event.target.value)}
                    >
                        <option value="all">Todos os serviços</option>
                        <option value="true">Listados</option>
                        <option value="false">Não listados</option>
                    </select>
                </label>
            </div>

            {isLoading && <p className="text-muted-foreground">Carregando serviços...</p>}
            {error && <p className="text-destructive">{error}</p>}

            {!isLoading && !error && (
                <>
                    <ServiceFilters filters={filters} countries={countries} onChange={setFilters} />
                    <p className="text-sm text-muted-foreground">
                        Mostrando {visibleServices.length} de {services.length} serviços
                    </p>
                    {visibleServices.length === 0 ? (
                        <p className="text-muted-foreground">Nenhum serviço com esses filtros.</p>
                    ) : (
                        <ServiceList services={visibleServices} />
                    )}
                    <p className="text-xs text-muted-foreground">
                        Energia e CO₂e referem-se à última coleta de cada serviço.
                    </p>
                </>
            )}
        </main>
    );
}
