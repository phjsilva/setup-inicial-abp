import { useState, type ReactNode } from 'react';
import { metricValue } from '@/lib/metric-format';
import { MetricBarChart } from '@/components/charts/MetricBarChart';
import { TimeSeriesChart } from '@/components/charts/TimeSeriesChart';
import { ServiceStatusBadge } from '@/components/services/ServiceStatusBadge';
import { widgets } from './widgetCatalog';
import { formatDateTime } from '@/lib/format';
import type { WidgetId } from '@/types/dashboard';
import type { MetricService, Snapshot } from '@/types/metrics';

function Rows({ rows }: { rows: { id: string; name: string; detail: ReactNode }[] }) {
    if (!rows.length) return <p className="text-sm text-muted-foreground">Sem dados no período.</p>;
    return (
        <ul className="gs-widget-rows">
            {rows.map((row) => (
                <li key={row.id}>
                    <span>{row.name}</span>
                    <span>{row.detail}</span>
                </li>
            ))}
        </ul>
    );
}

function ComparisonWidget({ services }: { services: MetricService[] }) {
    const [first, setFirst] = useState('');
    const [second, setSecond] = useState('');
    if (services.length < 2)
        return (
            <p className="text-sm text-muted-foreground">
                São necessários dois serviços para comparar.
            </p>
        );
    const firstId = services.some((service) => service.id === first) ? first : services[0].id;
    const secondId = services.some((service) => service.id === second && service.id !== firstId)
        ? second
        : services.find((service) => service.id !== firstId)!.id;
    const left = services.find((service) => service.id === firstId)!;
    const right = services.find((service) => service.id === secondId)!;
    return (
        <>
            <div className="grid gap-2 sm:grid-cols-2">
                <label>
                    Serviço principal
                    <select value={firstId} onChange={(e) => setFirst(e.target.value)}>
                        {services.map((service) => (
                            <option key={service.id} value={service.id}>
                                {service.name}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Comparar com
                    <select value={secondId} onChange={(e) => setSecond(e.target.value)}>
                        {services
                            .filter((service) => service.id !== firstId)
                            .map((service) => (
                                <option key={service.id} value={service.id}>
                                    {service.name}
                                </option>
                            ))}
                    </select>
                </label>
            </div>
            <Rows
                rows={[left, right].map((service) => ({
                    ...service,
                    detail: metricValue(service.energy, 'kWh'),
                }))}
            />
        </>
    );
}

const timelines = {
    trend: { key: 'energy', unit: 'kWh', color: '#34d399' },
    'carbon-trend': { key: 'carbon', unit: 'g CO₂e', color: '#6ee7b7' },
    'cpu-trend': { key: 'cpu', unit: '%', color: '#93c5fd' },
    'memory-trend': { key: 'memory', unit: 'GB', color: '#c4b5fd' },
    'power-trend': { key: 'power', unit: 'W', color: '#fcd34d' },
} as const;

function isTimeline(id: WidgetId): id is keyof typeof timelines {
    return Object.hasOwn(timelines, id);
}

export function WidgetValue({ id, snapshot }: { id: WidgetId; snapshot: Snapshot }) {
    const { services, points } = snapshot;
    if (isTimeline(id)) {
        const { key, unit, color } = timelines[id];
        return (
            <TimeSeriesChart
                data={points.flatMap((point) =>
                    point[key] === null ? [] : [{ time: point.time, value: point[key] }],
                )}
                label={widgets[id].name}
                color={color}
                formatValue={(value) => metricValue(value, unit)}
                responsive
            />
        );
    }
    if (id === 'energy-by-service') {
        const data = services
            .filter((service) => service.energy !== null)
            .sort((a, b) => (b.energy ?? 0) - (a.energy ?? 0))
            .slice(0, 8)
            .map(({ id, name, energy }) => ({ id, name, value: energy }));
        return <MetricBarChart data={data} label={widgets[id].name} unit="kWh" />;
    }
    if (id === 'status')
        return (
            <Rows
                rows={services.map((service) => ({
                    ...service,
                    detail: <ServiceStatusBadge status={service.status} />,
                }))}
            />
        );
    if (id === 'collections')
        return (
            <Rows
                rows={services.map((service) => ({
                    ...service,
                    detail: service.collectedAt
                        ? formatDateTime(service.collectedAt)
                        : 'Sem amostras',
                }))}
            />
        );
    if (id === 'availability')
        return (
            <Rows
                rows={[
                    {
                        id: 'available',
                        name: 'Disponíveis',
                        detail: services.filter((service) => service.status === 'available').length,
                    },
                    {
                        id: 'unavailable',
                        name: 'Indisponíveis',
                        detail: services.filter((service) => service.status === 'unavailable')
                            .length,
                    },
                    {
                        id: 'missing',
                        name: 'Sem métricas',
                        detail: services.filter((service) => service.status === 'metrics_missing')
                            .length,
                    },
                ]}
            />
        );
    if (id === 'regions') {
        const regions = [
            ...new Map(services.map((service) => [service.regionCode, service])).values(),
        ];
        return (
            <Rows
                rows={regions.map((region) => ({
                    id: region.regionCode,
                    name: region.region,
                    detail: metricValue(region.intensity, 'gCO₂e/kWh'),
                }))}
            />
        );
    }
    if (id === 'comparison') return <ComparisonWidget services={services} />;
    if (id === 'ranking')
        return (
            <Rows
                rows={services
                    .filter((service) => service.carbon !== null)
                    .sort((a, b) => (b.carbon ?? 0) - (a.carbon ?? 0))
                    .slice(0, 5)
                    .map((service, index) => ({
                        ...service,
                        name: `${index + 1}. ${service.name}`,
                        detail: metricValue(service.carbon, 'g CO₂e'),
                    }))}
            />
        );

    const unit = { energy: 'kWh', carbon: 'g CO₂e', cpu: '%', memory: 'GB', power: 'W' }[id];
    const sum = id === 'energy' || id === 'carbon';
    const valid = services.filter((service) => service[id] !== null && service.samples > 0);
    const total = valid.reduce(
        (acc, service) => acc + (service[id] ?? 0) * (sum ? 1 : service.samples),
        0,
    );
    const divisor = sum ? 1 : valid.reduce((acc, service) => acc + service.samples, 0);
    return <p className="gs-value">{metricValue(valid.length ? total / divisor : null, unit)}</p>;
}
