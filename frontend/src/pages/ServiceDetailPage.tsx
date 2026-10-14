import { useParams } from 'react-router';
import { findServiceById } from '@/mocks/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ServiceStatus } from '@/types/service';

const statusInfo: Record<ServiceStatus, { label: string; className: string }> = {
  available: {
    label: 'Disponível',
    className: 'bg-emerald-100 text-emerald-800',
  },
  metrics_missing: {
    label: 'Sem métricas',
    className: 'bg-amber-100 text-amber-800',
  },
  unavailable: {
    label: 'Indisponível',
    className: 'bg-red-100 text-red-800',
  },
};

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-xl font-semibold">{value}</dd>
    </div>
  );
}

export function ServiceDetailPage() {
  const { id } = useParams();
  const service = id ? findServiceById(id) : undefined;

  if (!service) {
    return (
      <main className="mx-auto min-h-screen max-w-5xl bg-background p-6">
        <h1 className="text-2xl font-semibold">Serviço não encontrado</h1>
        <p className="mt-2 text-muted-foreground">
          Não existe serviço com o identificador "{id}".
        </p>
      </main>
    );
  }

  const status = statusInfo[service.status];

  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-6 bg-background p-6">
      <header>
        <p className="text-sm text-muted-foreground">Detalhamento de serviço</p>
        <h1 className="text-3xl font-semibold">{service.name}</h1>
        <p className="font-mono text-sm text-muted-foreground">
          ID: {service.id}
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Estado do serviço</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <span
            className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${status.className}`}
          >
            {status.label}
          </span>
          <p className="text-sm text-muted-foreground">
            Visto por último em{' '}
            {new Date(service.lastSeenAt).toLocaleString('pt-BR')}
          </p>
        </CardContent>
      </Card>
            <Card>
        <CardHeader>
          <CardTitle>Métricas</CardTitle>
        </CardHeader>
        <CardContent>
          {service.metrics ? (
            <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <InfoItem
                label="CPU"
                value={`${service.metrics.cpuPercent.toLocaleString('pt-BR')} %`}
              />
              <InfoItem
                label="Memória"
                value={`${service.metrics.memoryGb.toLocaleString('pt-BR')} GB`}
              />
              <InfoItem
                label="Disco"
                value={`${service.metrics.diskGb.toLocaleString('pt-BR')} GB`}
              />
              <InfoItem
                label="Rede"
                value={`${service.metrics.networkGb.toLocaleString('pt-BR')} GB`}
              />
            </dl>
          ) : (
            <p className="text-muted-foreground">
              Nenhuma métrica disponível para este serviço.
            </p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Localização</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <InfoItem label="Cidade" value={service.location.city} />
            <InfoItem label="Região" value={service.location.region} />
            <InfoItem label="País" value={service.location.country} />
            <InfoItem
              label="Código da região"
              value={service.location.regionCode}
            />
            <InfoItem
              label="Coordenadas"
              value={`${service.location.latitude.toFixed(4)}, ${service.location.longitude.toFixed(4)}`}
            />
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Indicadores ambientais</CardTitle>
        </CardHeader>
        <CardContent>
          {service.environmental ? (
            <dl className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <InfoItem
                label="Potência estimada"
                value={`${service.environmental.powerWatts.toLocaleString('pt-BR')} W`}
              />
              <InfoItem
                label="Energia estimada"
                value={`${service.environmental.energyKwh.toLocaleString('pt-BR', { maximumFractionDigits: 5 })} kWh`}
              />
              <InfoItem
                label="CO₂e estimado"
                value={`${service.environmental.co2eGrams.toLocaleString('pt-BR')} g`}
              />
              <InfoItem
                label="Intensidade de carbono"
                value={`${service.environmental.carbonIntensity.toLocaleString('pt-BR')} gCO₂e/kWh`}
              />
              <InfoItem
                label="Energia renovável"
                value={`${service.environmental.renewableSharePercent.toLocaleString('pt-BR')} %`}
              />
            </dl>
          ) : (
            <p className="text-muted-foreground">
              Indicadores ambientais indisponíveis: o serviço não possui
              métricas para o cálculo.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}