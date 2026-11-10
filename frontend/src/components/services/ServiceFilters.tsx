import { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { statusInfo } from '@/lib/serviceStatus';
import { useClickOutside } from '@/hooks/useClickOutside';
import type { ServiceStatus } from '@/types/service';
import type { ServiceFilterValues, ServiceSort } from './filterServices';

interface ServiceFiltersProps {
    filters: ServiceFilterValues;
    countries: string[];
    onChange: (filters: ServiceFilterValues) => void;
}

interface FilterSelectProps {
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
}

const fieldClass = 'flex flex-col gap-1 text-sm font-medium';
const inputClass = 'h-9 rounded-md border border-input bg-secondary px-3 text-sm font-normal';
const visibleStatuses = ['Disponível', 'Sem métricas', 'Indisponível'];

function FilterSelect({ value, options, onChange }: FilterSelectProps) {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const pickerRef = useRef<HTMLDivElement>(null);

    useClickOutside(open, buttonRef, pickerRef, setOpen);

    const selected = options.find((option) => option.value === value);

    return (
        <div className={`relative ${open ? 'z-50' : 'z-0'}`}>
            <button
                ref={buttonRef}
                type="button"
                aria-expanded={open}
                onClick={() => setOpen((current) => !current)}
                className={`flex h-9 w-full items-center justify-between gap-2 rounded-md border px-3 text-sm font-normal transition-colors ${
                    open
                        ? 'border-emerald-400/40 bg-emerald-400/5'
                        : 'border-input bg-secondary hover:border-emerald-400/30'
                }`}
            >
                <span className="truncate">{selected?.label ?? value}</span>
                <ChevronDown
                    aria-hidden="true"
                    className={`size-4 shrink-0 text-muted-foreground transition-transform ${
                        open ? 'rotate-180' : ''
                    }`}
                />
            </button>

            {open && (
                <div
                    ref={pickerRef}
                    className="absolute left-0 top-full z-[60] mt-2 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-background p-2 shadow-xl shadow-black/30"
                >
                    <div className="flex flex-col gap-1">
                        {options.map((option) => {
                            const selected = option.value === value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setOpen(false);
                                    }}
                                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                                        selected
                                            ? 'bg-emerald-400/10 font-medium text-emerald-300'
                                            : 'text-foreground/80 hover:bg-emerald-400/[0.07] hover:text-emerald-200'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export function ServiceFilters({ filters, countries, onChange }: ServiceFiltersProps) {
    return (
        <Card aria-label="Filtros" className="relative z-20 overflow-visible">
            <CardContent className="relative grid gap-4 overflow-visible sm:grid-cols-2 lg:grid-cols-4">
                <label className={fieldClass}>
                    Buscar
                    <input
                        type="search"
                        className={inputClass}
                        placeholder="Nome ou ID"
                        value={filters.search}
                        onChange={(event) => onChange({ ...filters, search: event.target.value })}
                    />
                </label>

                <label className={fieldClass}>
                    Estado
                    <FilterSelect
                        value={filters.status}
                        options={[
                            { value: 'all', label: 'Todos' },
                            ...Object.entries(statusInfo)
                                .filter(([, info]) => visibleStatuses.includes(info.label))
                                .map(([value, info]) => ({
                                    value,
                                    label: info.label,
                                })),
                        ]}
                        onChange={(value) =>
                            onChange({
                                ...filters,
                                status: value as ServiceStatus | 'all',
                            })
                        }
                    />
                </label>

                <label className={fieldClass}>
                    País
                    <FilterSelect
                        value={filters.country}
                        options={[
                            { value: 'all', label: 'Todos' },
                            ...countries.map((country) => ({
                                value: country,
                                label: country,
                            })),
                        ]}
                        onChange={(value) => onChange({ ...filters, country: value })}
                    />
                </label>

                <label className={fieldClass}>
                    Ordenar por
                    <FilterSelect
                        value={filters.sort}
                        options={[
                            { value: 'co2e', label: 'Maior emissão' },
                            { value: 'energy', label: 'Maior consumo' },
                            { value: 'name', label: 'Nome' },
                        ]}
                        onChange={(value) =>
                            onChange({
                                ...filters,
                                sort: value as ServiceSort,
                            })
                        }
                    />
                </label>
            </CardContent>
        </Card>
    );
}
