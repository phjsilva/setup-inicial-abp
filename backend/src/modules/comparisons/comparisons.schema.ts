import { z } from 'zod';

const selectionSchema = z.object({
    selectionId: z.string().trim().min(1),
    externalId: z
        .string()
        .trim()
        .min(1)
        .max(100)
        .regex(/^[a-zA-Z0-9._-]+$/),
    simulatedRegionCode: z.string().trim().min(1).nullable(),
});

export const createComparisonSchema = z.object({
    range: z.enum(['1h', '6h', '24h', '7d', '30d']),
    selections: z
        .array(selectionSchema)
        .min(2, 'Selecione pelo menos dois serviços')
        .max(5, 'Selecione no máximo cinco serviços'),
});

export type CreateComparisonInput = z.infer<typeof createComparisonSchema>;
