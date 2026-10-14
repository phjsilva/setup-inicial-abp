import { useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { findServiceById } from '@/mocks/services';
import {
  buildServiceHistory,
  mockOverview,
  type Range,
} from '@/mocks/serviceHistory';
import { ChartCard } from '@/components/charts/ChartCard';
import { TimeSeriesChart } from '@/components/charts/TimeSeriesChart';
import { ServiceStatusBadge } from '@/components/services/ServiceStatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDateTime, formatNumber } from '@/lib/format';

const periods: Record<Range, string> = {
  '1h': 'Última hora',
  '6h': 'Últimas 6 horas',
  '24h': 'Últimas 24 horas',
  '7d': 'Últimos 7 dias',
  '30d': 'Últimos 30 dias',
};
function InfoItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
export function ServiceDetailPage() {
  const { id } = useParams();
  const [range, setRange] = useState<Range>('24h');
  const mock = id ? findServiceById(id) : undefined;
  const current = mock ? mockOverview(mock) : null;
  const history = mock ? buildServiceHistory(mock, range) : null;
  const error = mock ? null : 'Serviço não encontrado nos dados simulados.';
  const historyError = null;
  const service = current?.service;
  const collection = current?.latestCollection;
  const metrics = collection?.metrics;
  const estimates = collection?.estimates;
  const location = service?.location;
  const charts = [
    {
      title: 'CO₂e por coleta',
      key: 'co2ePerCollectionGrams',
      color: '#34d399',
      unit: 'g CO₂e',
    },
    {
      title: 'Potência estimada',
      key: 'powerWatts',
      color: '#60a5fa',
      unit: 'W',
    },
    { title: 'Uso de CPU', key: 'cpuPercent', color: '#a78bfa', unit: '%' },
    { title: 'Memória em uso', key: 'memoryGb', color: '#fbbf24', unit: 'GB' },
  ] as const;
  return (
    <main className="mx-auto max-w-7xl space-y-4 p-4 sm:p-6">
      <Link to="/dashboard" className="text-sm text-primary hover:underline">
        ← Serviços
      </Link>
      <p className="text-xs text-amber-300">
        SIMULADO · curva fictícia integrada pela duração das faixas; amostra de
        referência de 30 s.
      </p>
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      {!service ? (
        !error && <p className="text-muted-foreground">Carregando serviço...</p>
      ) : (
        <>
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                {service.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {service.id} ·{' '}
                {[location?.city, location?.region, location?.country]
                  .filter(Boolean)
                  .join(', ') || 'Localização não informada'}
              </p>
            </div>
            <div
              aria-label="Período dos gráficos"
              className="flex rounded-lg border border-border bg-background/60 p-1"
            >
              {(Object.keys(periods) as Range[]).map((value) => (
                <button
                  key={value}
                  aria-pressed={range === value}
                  onClick={() => setRange(value)}
                  className={`rounded-md px-3 py-1.5 text-xs transition-colors ${range === value ? 'bg-primary/15 font-semibold text-primary' : 'text-muted-foreground hover:bg-white/5'}`}
                >
                  {value}
                </button>
              ))}
            </div>
          </header>
          <Card>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4 xl:grid-cols-7">
                <InfoItem
                  label="Status"
                  value={
                    <div className="flex flex-wrap gap-1">
                      <ServiceStatusBadge status={service.status} />
                      <span className="text-xs text-muted-foreground">
                        {service.active ? 'Listado' : 'Não listado'}
                      </span>
                    </div>
                  }
                />
                <InfoItem label="Região" value={location?.regionCode ?? '—'} />
                <InfoItem
                  label="Coordenadas"
                  value={
                    location?.latitude != null && location.longitude != null
                      ? `${formatNumber(location.latitude, '', 2)}, ${formatNumber(location.longitude, '', 2)}`
                      : '—'
                  }
                />
                <InfoItem
                  label="Visto por último"
                  value={formatDateTime(service.lastSeenAt)}
                />
                <InfoItem
                  label="CPU"
                  value={formatNumber(metrics?.cpuPercent, '%')}
                />
                <InfoItem
                  label="Memória"
                  value={formatNumber(metrics?.memoryGb, 'GB', 2)}
                />
                <InfoItem
                  label="Disco"
                  value={formatNumber(metrics?.diskGb, 'GB', 2)}
                />
                <InfoItem
                  label="Rede"
                  value={formatNumber(metrics?.networkGb, 'GB', 2)}
                />
                <InfoItem
                  label="Potência estimada"
                  value={formatNumber(estimates?.powerWatts, 'W')}
                />
                <InfoItem
                  label="Energia (última coleta)"
                  value={formatNumber(
                    estimates ? estimates.energyKwh * 1e6 : null,
                    'mWh',
                    2,
                  )}
                />
                <InfoItem
                  label="CO₂e (última coleta)"
                  value={formatNumber(
                    estimates ? estimates.co2eGrams * 1000 : null,
                    'mg CO₂e',
                    2,
                  )}
                />
                <InfoItem
                  label="Intensidade da região"
                  value={formatNumber(
                    location?.currentCarbonIntensityGco2ePerKwh ??
                      estimates?.carbonIntensityGco2ePerKwh,
                    'g CO₂e/kWh',
                    0,
                  )}
                />
                <InfoItem
                  label="Energia no período"
                  value={formatNumber(history?.summary.energyKwh, 'kWh', 3)}
                />
                <InfoItem
                  label="CO₂e no período"
                  value={formatNumber(history?.summary.co2eGrams, 'g CO₂e', 2)}
                />
              </dl>
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground">
            Última coleta: {formatDateTime(collection?.collectedAt)} · Status
            atualizado: {formatDateTime(service.statusUpdatedAt)}
            {history &&
              ` · ${history.summary.sampleCount} faixas simuladas no período`}
          </p>
          {!collection && (
            <p className="text-sm text-muted-foreground">
              Este serviço ainda não possui coleta. O status atual é
              independente das métricas.
            </p>
          )}
          {historyError && (
            <p role="alert" className="text-destructive">
              {historyError}
            </p>
          )}
          <div className="grid gap-4 lg:grid-cols-2">
            {charts.map((chart) => (
              <ChartCard
                key={chart.key}
                title={chart.title}
                subtitle={periods[range]}
              >
                {!history ? (
                  <p className="text-muted-foreground">
                    {historyError
                      ? 'Histórico indisponível.'
                      : 'Carregando histórico...'}
                  </p>
                ) : (
                  <TimeSeriesChart
                    label={chart.title}
                    color={chart.color}
                    data={history.points.map((point) => ({
                      time: point.timestamp,
                      value: point[chart.key],
                    }))}
                    formatValue={(value) => formatNumber(value, chart.unit, 2)}
                  />
                )}
              </ChartCard>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
