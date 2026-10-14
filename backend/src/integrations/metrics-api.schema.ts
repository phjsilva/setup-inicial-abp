import { z } from 'zod';

export const metricsServiceSchema = z.object({
    id: z.string(),
    name: z.string(),
    location: z.object({
        region_code: z.string(),
        country: z.string(),
        region: z.string(),
        city: z.string().nullish(),
        latitude: z.number().nullish(),
        longitude: z.number().nullish(),
    }),
    metrics_path: z.string(),
});

export const metricsResponseSchema = z.object({
    collection_interval_seconds: z.number().int().positive(),
    metrics: z.object({
        cpu_percent: z.number().min(0).max(100),
        memory_gb: z.number().nonnegative(),
        disk_gb: z.number().nonnegative(),
        network_gb: z.number().nonnegative(),
    }),
});

export const servicesResponseSchema = z.array(metricsServiceSchema);

export type MetricsService = z.infer<typeof metricsServiceSchema>;
export type MetricsResponse = z.infer<typeof metricsResponseSchema>;
