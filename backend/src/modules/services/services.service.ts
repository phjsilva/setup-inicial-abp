import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { ServiceRepository } from './services.repository.js';
import {
  ServiceOverviewDto,
  ServiceRow,
  CollectionRow,
  ServicesListDto,
  ServiceWithLatestRow,
} from './services.types.js';
import type { ServicesFilters } from './services.schema.js';

const round = (value: number, decimals: number) =>
  Number(value.toFixed(decimals));
const toIso = (date: Date) => date.toISOString().replace(/\.\d{3}Z$/, 'Z');

export class ServicesService {
  constructor(private readonly repository: ServiceRepository) {}

  async list(filters: ServicesFilters): Promise<ServicesListDto> {
    const rows = await this.repository.findAllWithLatest(filters);
    return {
      generatedAt: toIso(new Date()),
      filters: {
        regionCode: filters.regionCode ?? null,
        active: filters.active ?? null,
      },
      services: rows.map((row) => {
        const collection = this.toCollection(row);
        const overview = this.toOverview(row, collection);
        return {
          ...overview.service,
          latestCollection: overview.latestCollection,
        };
      }),
    };
  }

  private toCollection(row: ServiceWithLatestRow): CollectionRow | null {
    if (row.coletado_em === null) return null;
    if (
      row.intervalo_metrica_segundos === null ||
      row.cpu_percent === null ||
      row.memory_gb === null ||
      row.disk_gb === null ||
      row.network_gb === null ||
      row.potencia_estimada_w === null ||
      row.energia_estimada_kwh === null ||
      row.collection_carbon_intensity === null ||
      row.co2e_estimado_g === null
    ) {
      throw new Error('Última coleta contém dados incompletos');
    }
    return {
      coletado_em: row.coletado_em,
      intervalo_metrica_segundos: row.intervalo_metrica_segundos,
      cpu_percent: row.cpu_percent,
      memory_gb: row.memory_gb,
      disk_gb: row.disk_gb,
      network_gb: row.network_gb,
      potencia_estimada_w: row.potencia_estimada_w,
      energia_estimada_kwh: row.energia_estimada_kwh,
      carbon_intensity: row.collection_carbon_intensity,
      co2e_estimado_g: row.co2e_estimado_g,
    };
  }

  async getByExternalId(externalId: string): Promise<ServiceOverviewDto> {
    const service =
      await this.repository.findWithRegionByExternalId(externalId);
    if (!service) {
      throw new NotFoundError(`Serviço ${externalId} não foi encontrado`);
    }

    const collection = await this.repository.findLatestByServiceId(service.id);
    return this.toOverview(service, collection);
  }

  private toOverview(
    service: ServiceRow,
    collection: CollectionRow | null,
  ): ServiceOverviewDto {
    return {
      service: {
        id: service.external_id,
        name: service.nome,
        active: service.ativo,
        status: service.status,
        statusUpdatedAt: toIso(service.status_atualizado_em),
        lastSeenAt: toIso(service.ultima_vez_visto_em),
        location: service.codigo
          ? {
              regionCode: service.codigo,
              country: service.pais!,
              region: service.regiao!,
              city: service.cidade,
              latitude:
                service.latitude === null ? null : round(service.latitude, 2),
              longitude:
                service.longitude === null ? null : round(service.longitude, 2),
              currentCarbonIntensityGco2ePerKwh: service.carbon_intensity!,
            }
          : null,
      },
      latestCollection: collection
        ? {
            collectedAt: toIso(collection.coletado_em),
            collectionIntervalSeconds: collection.intervalo_metrica_segundos,
            metrics: {
              cpuPercent: round(collection.cpu_percent, 2),
              memoryGb: round(collection.memory_gb, 2),
              diskGb: round(collection.disk_gb, 2),
              networkGb: round(collection.network_gb, 2),
            },
            estimates: {
              powerWatts: round(collection.potencia_estimada_w, 1),
              energyKwh: round(collection.energia_estimada_kwh, 10),
              co2eGrams: round(collection.co2e_estimado_g, 7),
              carbonIntensityGco2ePerKwh: collection.carbon_intensity,
            },
          }
        : null,
    };
  }
}
