import { z } from 'zod';
import { snapshotRangeSchema } from '../analytics/metrics-snapshot.schema.js';

const widget = z.enum([
    'energy',
    'carbon',
    'trend',
    'carbon-trend',
    'cpu-trend',
    'memory-trend',
    'power-trend',
    'energy-by-service',
    'power',
    'cpu',
    'memory',
    'status',
    'collections',
    'availability',
    'ranking',
    'regions',
    'comparison',
]);
export const dashboardSchema = z.object({
    name: z.string().trim().min(1).max(48),
    range: snapshotRangeSchema,
    widgets: z
        .array(widget)
        .max(widget.options.length)
        .refine((values) => new Set(values).size === values.length),
});
export const dashboardIdSchema = z.object({ id: z.string().regex(/^[1-9][0-9]{0,17}$/) });
export const dashboardMetricsSchema = z.object({ range: snapshotRangeSchema });
export type DashboardInput = z.infer<typeof dashboardSchema>;
export type DashboardMetricsQuery = z.infer<typeof dashboardMetricsSchema>;
