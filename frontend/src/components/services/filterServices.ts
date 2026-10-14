import type { ServiceStatus, ServiceSummary } from '@/types/service';

export type ServiceSort = 'name' | 'co2e' | 'energy';

export interface ServiceFilterValues {
  search: string;
  status: ServiceStatus | 'all';
  country: string;
  sort: ServiceSort;
}

export const defaultFilters: ServiceFilterValues = {
  search: '',
  status: 'all',
  country: 'all',
  sort: 'co2e',
};

export function listCountries(services: ServiceSummary[]): string[] {
  return Array.from(
    new Set(services.map((service) => service.location?.country ?? '—')),
  ).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

export function filterServices(
  services: ServiceSummary[],
  filters: ServiceFilterValues,
): ServiceSummary[] {
  const search = filters.search.trim().toLowerCase();

  const filtered = services.filter((service) => {
    const matchesSearch =
      search === '' ||
      service.name.toLowerCase().includes(search) ||
      service.id.toLowerCase().includes(search);
    const matchesStatus =
      filters.status === 'all' || service.status === filters.status;
    const matchesCountry =
      filters.country === 'all' ||
      (service.location?.country ?? '—') === filters.country;

    return matchesSearch && matchesStatus && matchesCountry;
  });

  return filtered.sort((a, b) => {
    if (filters.sort === 'name') {
      return a.name.localeCompare(b.name, 'pt-BR');
    }

    const valueOf = (service: ServiceSummary) =>
      filters.sort === 'co2e'
        ? (service.environmental?.co2eGrams ?? -1)
        : (service.environmental?.energyKwh ?? -1);

    return valueOf(b) - valueOf(a);
  });
}
