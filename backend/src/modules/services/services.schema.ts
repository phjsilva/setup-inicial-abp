import { z } from 'zod';

export const getServiceParamsSchema = z.object({
    externalId: z
        .string()
        .trim()
        .min(1, 'externalId é obrigatório')
        .max(100, 'externalId muito longo')
        .regex(/^[a-zA-Z0-9._-]+$/, 'externalId com caracteres inválidos'),
});
