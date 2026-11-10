import type { ServiceSummary } from '@/types/service';
import type { Region } from '@/types/api';

type RegionGroup = {
    code: string;
    country: string;
    region: string;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
    services: ServiceSummary[];
};

export function groupServicesByRegion(services: ServiceSummary[]): Region[] {
    const groupedRegions = services.reduce<Map<string, RegionGroup>>((map, service) => {
        const location = service.location;
        if (location === null) return map;

        const code = location.regionCode;

        if (!map.has(code)) {
            map.set(code, {
                code,
                country: location.country,
                region: location.region,
                city: location.city,
                latitude: location.latitude,
                longitude: location.longitude,
                services: [],
            });
        }

        map.get(code)!.services.push(service);

        return map;
    }, new Map());

    return Array.from(groupedRegions.values(), (region) => {
        const withMetrics = region.services.filter((service) => service.environmental != null);

        const energyKwh = withMetrics.reduce(
            (total, service) => total + service.environmental!.energyKwh,
            0,
        );

        const co2eGrams = withMetrics.reduce(
            (total, service) => total + service.environmental!.co2eGrams,
            0,
        );

        const gco2ePerKwh =
            energyKwh > 0
                ? withMetrics.reduce(
                      (total, service) =>
                          total +
                          service.environmental!.carbonIntensity * service.environmental!.energyKwh,
                      0,
                  ) / energyKwh
                : null;

        const weightedRenewableShare = withMetrics.reduce<number | null>((total, service) => {
            const environmental = service.environmental!;

            if (environmental.energyKwh === 0) return total;

            if (total === null || environmental.renewableSharePercent === null) {
                return null;
            }

            return total + environmental.renewableSharePercent * environmental.energyKwh;
        }, 0);

        const renewableSharePercent =
            energyKwh > 0 && weightedRenewableShare !== null
                ? weightedRenewableShare / energyKwh
                : null;

        return {
            code: region.code,
            country: region.country,
            region: region.region,
            city: region.city,
            latitude: region.latitude,
            longitude: region.longitude,
            gco2ePerKwh,
            renewableSharePercent,
            carbonSource: null,
            servicesCount: region.services.length,
            energyKwh,
            co2eGrams,
            statusCounts: {
                available: region.services.filter((service) => service.status === 'available')
                    .length,
                unavailable: region.services.filter((service) => service.status === 'unavailable')
                    .length,
                metricsMissing: region.services.filter(
                    (service) => service.status === 'metrics_missing',
                ).length,
            },
        };
    });
}
