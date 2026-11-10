import { z } from 'zod';

export const listRankingsQuerySchema = z
    .object({
        criterion: z.enum(['co2eGrams', 'energyKwh']).default('co2eGrams'),
        range: z.enum(['1h', '6h', '24h', '7d', '30d']).default('24h'),
    })
    .strict();

export type RankingsQuery = z.output<typeof listRankingsQuerySchema>;
