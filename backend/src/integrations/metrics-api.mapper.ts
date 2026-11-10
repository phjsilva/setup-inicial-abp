import type { DiscoveredService } from '../shared/types/index.js';
import type { MetricsService } from './metrics-api.schema.js';

export function toDiscoveredService(raw: MetricsService): DiscoveredService {
    return {
        id: raw.id,
        name: raw.name,
        metricsPath: raw.metrics_path,
        location: {
            regionCode: raw.location.region_code,
            country: raw.location.country,
            region: raw.location.region,
            city: raw.location.city ?? null,
            latitude: raw.location.latitude ?? null,
            longitude: raw.location.longitude ?? null,
        },
    };
}
