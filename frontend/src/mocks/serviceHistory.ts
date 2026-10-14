import type { ServiceDetail } from '@/types/service';
export type Range = '1h' | '6h' | '24h' | '7d' | '30d';
const seconds: Record<Range, number> = {
  '1h': 3600,
  '6h': 21600,
  '24h': 86400,
  '7d': 604800,
  '30d': 2592000,
};
// Integra uma curva fictícia por faixas temporais, sem representar as faixas como coletas reais.
// Cada ponto é a média simulada de uma faixa; o total usa a duração dela em segundos.
export function buildServiceHistory(service: ServiceDetail, range: Range) {
  const to = new Date(service.collectedAt ?? service.lastSeenAt).getTime();
  const duration = seconds[range];
  const from = to - duration * 1000;
  const count = service.metrics && service.environmental ? 120 : 0;
  const bucketSeconds = duration / 120;
  const points = Array.from({ length: count }, (_, index) => {
    const factor = 1 + Math.sin(index * 0.23) * 0.16;
    const powerWatts = service.environmental!.powerWatts * factor;
    const energyKwh = (powerWatts * bucketSeconds) / 3_600_000;
    return {
      timestamp: new Date(
        from + (index + 0.5) * bucketSeconds * 1000,
      ).toISOString(),
      cpuPercent: Math.min(100, service.metrics!.cpuPercent * factor),
      memoryGb: service.metrics!.memoryGb * factor,
      powerWatts,
      co2ePerCollectionGrams:
        ((powerWatts * 30) / 3_600_000) *
        service.environmental!.carbonIntensity,
      energyKwh,
      co2eGrams: energyKwh * service.environmental!.carbonIntensity,
    };
  });
  return {
    serviceId: service.id,
    range,
    period: {
      from: new Date(from).toISOString(),
      to: new Date(to).toISOString(),
    },
    summary: {
      sampleCount: count,
      energyKwh: count
        ? points.reduce((total, point) => total + point.energyKwh, 0)
        : null,
      co2eGrams: count
        ? points.reduce((total, point) => total + point.co2eGrams, 0)
        : null,
    },
    points,
  };
}
export function mockOverview(service: ServiceDetail) {
  return {
    service: {
      ...service,
      active: service.active ?? true,
      statusUpdatedAt: service.statusUpdatedAt ?? service.lastSeenAt,
      location: service.location
        ? {
            ...service.location,
            currentCarbonIntensityGco2ePerKwh:
              service.environmental?.carbonIntensity,
          }
        : null,
    },
    latestCollection:
      service.metrics && service.environmental
        ? {
            collectedAt: service.collectedAt ?? service.lastSeenAt,
            collectionIntervalSeconds: 30,
            metrics: service.metrics,
            estimates: {
              ...service.environmental,
              carbonIntensityGco2ePerKwh: service.environmental.carbonIntensity,
            },
          }
        : null,
  };
}
