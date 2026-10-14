import { Card, CardContent } from '@/components/ui/card';
import { statusInfo } from '@/lib/serviceStatus';
import type { ServiceStatus } from '@/types/service';
import type { ServiceFilterValues, ServiceSort } from './filterServices';

interface ServiceFiltersProps {
  filters: ServiceFilterValues;
  countries: string[];
  onChange: (filters: ServiceFilterValues) => void;
}

const fieldClass = 'flex flex-col gap-1 text-sm font-medium';
const inputClass =
  'h-9 rounded-md border border-input bg-secondary px-3 text-sm font-normal';

export function ServiceFilters({
  filters,
  countries,
  onChange,
}: ServiceFiltersProps) {
  return (
    <Card aria-label="Filtros">
      <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className={fieldClass}>
          Buscar
          <input
            type="search"
            className={inputClass}
            placeholder="Nome ou ID"
            value={filters.search}
            onChange={(event) =>
              onChange({ ...filters, search: event.target.value })
            }
          />
        </label>
        <label className={fieldClass}>
          Estado
          <select
            className={inputClass}
            value={filters.status}
            onChange={(event) =>
              onChange({
                ...filters,
                status: event.target.value as ServiceStatus | 'all',
              })
            }
          >
            <option value="all">Todos</option>
            {Object.entries(statusInfo).map(([value, info]) => (
              <option key={value} value={value}>
                {info.label}
              </option>
            ))}
          </select>
        </label>
        <label className={fieldClass}>
          País
          <select
            className={inputClass}
            value={filters.country}
            onChange={(event) =>
              onChange({ ...filters, country: event.target.value })
            }
          >
            <option value="all">Todos</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </label>
        <label className={fieldClass}>
          Ordenar por
          <select
            className={inputClass}
            value={filters.sort}
            onChange={(event) =>
              onChange({ ...filters, sort: event.target.value as ServiceSort })
            }
          >
            <option value="co2e">Maior emissão</option>
            <option value="energy">Maior consumo</option>
            <option value="name">Nome</option>
          </select>
        </label>
      </CardContent>
    </Card>
  );
}
