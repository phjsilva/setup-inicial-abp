import type { ServiceDetail } from '@/types/service';

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
];

export function findServiceById(id: string): ServiceDetail | undefined {
  return services.find((service) => service.id === id);
}