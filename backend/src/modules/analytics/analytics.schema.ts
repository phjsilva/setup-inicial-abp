import { z } from 'zod';

export const getCollectionsQuerySchema = z.object({
    range: z.enum(['1h', '6h', '24h', '7d', '30d']).default('24h'),

    maxPoints: z.coerce
        .number()
        .int('maxPoints deve ser inteiro')
        .min(1, 'maxPoints deve ser pelo menos 1')
        .max(300, 'maxPoints deve ser no máximo 300')
        .default(120),

    to: z.iso
        .datetime({ offset: true })
        .transform((value) => new Date(value))
        .optional(),
});

export const getCollectionsByExternalIdSchema = z.object({
    externalId: z
        .string()
        .trim()
        .min(1, 'externalId é obrigatório')
        .max(100, 'externalId muito longo')
        .regex(/^[a-zA-Z0-9._-]+$/, 'externalId com caracteres inválidos'),
});

export type CollectionsQuery = z.output<typeof getCollectionsQuerySchema>;
