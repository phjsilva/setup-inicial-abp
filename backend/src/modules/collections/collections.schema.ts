import { z } from 'zod';

export const listCollectionStatusesQuerySchema = z
    .object({
        search: z.string().trim().max(100).optional(),

        result: z.enum(['success', 'failure', 'pending']).optional(),

        page: z.coerce.number().int().min(1).default(1),

        limit: z.coerce.number().int().min(1).max(100).default(20),
    })
    .strict();

export type CollectionStatusFilters = z.infer<typeof listCollectionStatusesQuerySchema>;
