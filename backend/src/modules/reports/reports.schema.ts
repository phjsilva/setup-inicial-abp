import { z } from 'zod';
import { snapshotRangeSchema } from '../analytics/metrics-snapshot.schema.js';

export const metricLabels = ['energy', 'carbon', 'cpu', 'memory', 'power'] as const;
export const reportFiltersSchema = z.object({
    title: z.string().trim().max(100).optional(),
    serviceIds: z
        .array(z.string().min(1).max(200))
        .min(1)
        .max(20)
        .refine((ids) => new Set(ids).size === ids.length),
    range: snapshotRangeSchema,
    metrics: z
        .array(z.enum(metricLabels))
        .min(1)
        .refine((keys) => new Set(keys).size === keys.length),
    visualization: z.enum(['line', 'bars', 'table']),
    end: z.iso.datetime().optional(),
});

export type ReportFilters = z.infer<typeof reportFiltersSchema>;
