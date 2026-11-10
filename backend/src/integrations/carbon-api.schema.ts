import { z } from 'zod';

export const regionsResponseSchema = z.object({
    regions: z.array(
        z.object({
            code: z.string(),
            country: z.string(),
            region: z.string(),
            city: z.string().nullish(),
            latitude: z.number().nullish(),
            longitude: z.number().nullish(),
            carbon_intensity_gco2e_per_kwh: z.number().nonnegative(),
            renewable_share_percent: z.number().min(0).max(100),
        }),
    ),
    total: z.number().int().nonnegative(),
});

export type RegionsResponse = z.infer<typeof regionsResponseSchema>;
