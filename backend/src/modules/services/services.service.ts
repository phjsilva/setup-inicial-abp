import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { ServiceRepository } from './services.repository.js';
import { ServiceOverviewDto } from './services.types.js';

const round = (value: number, decimals: number) => Number(value.toFixed(decimals));
const toIso = (date: Date) => date.toISOString().replace(/\.\d{3}Z$/, 'Z');

export class ServicesService {
    constructor(private readonly repository: ServiceRepository) {}

    async getByExternalId(externalId: string): Promise<ServiceOverviewDto> {
        const service = await this.repository.findWithRegionByExternalId(externalId);
        if (!service) {
            throw new NotFoundError(`Serviço ${externalId} não foi encontrado`);
        }

        const collection = await this.repository.findLatestByServiceId(service.id);

        return {
            service: {
                id: service.external_id,
                name: service.nome,
                active: service.ativo,
                status: service.status,
                lastSeenAt: toIso(service.ultima_vez_visto_em),
                location: service.codigo
                    ? {
                          regionCode: service.codigo,
                          country: service.pais!,
                          region: service.regiao!,
                          city: service.cidade,
                          latitude: service.latitude === null ? null : round(service.latitude, 2),
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
