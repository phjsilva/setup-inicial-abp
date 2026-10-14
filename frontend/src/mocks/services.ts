import type { ServiceDetail, ServiceSummary } from '@/types/service';
const services: ServiceDetail[] = [
  {
    id: 'svc-001',
    name: 'API de Pagamentos',
    status: 'available',
    lastSeenAt: '2026-10-09T18:30:00Z',
    location: {
      regionCode: 'BR-SP',
      country: 'Brasil',
      region: 'São Paulo',
      city: 'São Paulo',
      latitude: -23.5505,
      longitude: -46.6333,
    },
    metrics: { cpuPercent: 42.5, memoryGb: 6.2, diskGb: 120, networkGb: 3.4 },
    environmental: {
      powerWatts: 46.09,
      energyKwh: 0.00384,
      co2eGrams: 0.376,
      carbonIntensity: 98,
      renewableSharePercent: 83.5,
    },
  },
  {
    id: 'svc-002',
    name: 'Serviço de Notificações',
    status: 'metrics_missing',
    lastSeenAt: '2026-10-09T17:05:00Z',
    location: {
      regionCode: 'US-VA',
      country: 'Estados Unidos',
      region: 'Virgínia',
      city: 'Ashburn',
      latitude: 39.0438,
      longitude: -77.4874,
    },
    metrics: null,
    environmental: null,
  },
  {
    id: 'svc-003',
    name: 'Gateway de Autenticação',
    status: 'unavailable',
    lastSeenAt: '2026-10-08T09:12:00Z',
    location: {
      regionCode: 'DE-HE',
      country: 'Alemanha',
      region: 'Hesse',
      city: 'Frankfurt',
      latitude: 50.1109,
      longitude: 8.6821,
    },
    metrics: null,
    environmental: null,
  },
  {
    id: 'svc-004',
    name: 'Catálogo de Produtos',
    status: 'available',
    lastSeenAt: '2026-10-09T18:30:00Z',
    location: {
      regionCode: 'US-VA',
      country: 'Estados Unidos',
      region: 'Virgínia',
      city: 'Ashburn',
      latitude: 39.0438,
      longitude: -77.4874,
    },
    metrics: { cpuPercent: 71.3, memoryGb: 12.8, diskGb: 240, networkGb: 9.1 },
    environmental: {
      powerWatts: 61.4,
      energyKwh: 0.00512,
      co2eGrams: 1.802,
      carbonIntensity: 352,
      renewableSharePercent: 21.4,
    },
  },
  {
    id: 'svc-005',
    name: 'Motor de Busca',
    status: 'available',
    lastSeenAt: '2026-10-09T18:25:00Z',
    location: {
      regionCode: 'IE-L',
      country: 'Irlanda',
      region: 'Leinster',
      city: 'Dublin',
      latitude: 53.3498,
      longitude: -6.2603,
    },
    metrics: { cpuPercent: 55, memoryGb: 8.4, diskGb: 80, networkGb: 5.7 },
    environmental: {
      powerWatts: 38.2,
      energyKwh: 0.00318,
      co2eGrams: 0.903,
      carbonIntensity: 284,
      renewableSharePercent: 41.2,
    },
  },
  {
    id: 'svc-006',
    name: 'Relatórios Financeiros',
    status: 'available',
    lastSeenAt: '2026-10-09T18:30:00Z',
    location: {
      regionCode: 'BR-SP',
      country: 'Brasil',
      region: 'São Paulo',
      city: 'São Paulo',
      latitude: -23.5505,
      longitude: -46.6333,
    },
    metrics: { cpuPercent: 18.9, memoryGb: 3.1, diskGb: 60, networkGb: 0.8 },
    environmental: {
      powerWatts: 27.6,
      energyKwh: 0.0023,
      co2eGrams: 0.225,
      carbonIntensity: 98,
      renewableSharePercent: 83.5,
    },
  },
];
// Coletas simuladas de 30 segundos; energia = potência × intervalo / 3.600.000.
services.forEach((service, index) => {
  service.active = index !== 4;
  service.statusUpdatedAt = service.lastSeenAt;
  service.collectionIntervalSeconds = 30;
  if (service.metrics && service.environmental) {
    service.collectedAt = service.lastSeenAt;
    service.environmental.energyKwh =
      (service.environmental.powerWatts * 30) / 3_600_000;
    service.environmental.co2eGrams =
      service.environmental.energyKwh * service.environmental.carbonIntensity;
  }
});
services[4].status = 'unavailable'; // Não listado, mas com coleta anterior.
services[2].location = null;
services[1].location = {
  ...services[1].location!,
  city: null,
  latitude: null,
  longitude: null,
};
export function findServiceById(id: string): ServiceDetail | undefined {
  return services.find((service) => service.id === id);
}
export function listServices(): ServiceSummary[] {
  return services;
}
