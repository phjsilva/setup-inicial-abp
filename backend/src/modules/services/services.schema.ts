import { z } from 'zod';

export const listServicesQuerySchema = z
  .object({
    regionCode: z
      .string({ error: 'regionCode deve ser uma string única' })
      .min(1, 'regionCode não pode ser vazio')
      .max(100, 'regionCode muito longo')
      .optional(),
    active: z
      .enum(['true', 'false'], {
        error: 'active deve ser uma string única: true ou false',
      })
      .transform((value) => value === 'true')
      .optional(),
  })
  .strict();
export type ServicesFilters = z.output<typeof listServicesQuerySchema>;

export const getServiceParamsSchema = z.object({
  externalId: z
    .string()
    .trim()
    .min(1, 'externalId é obrigatório')
    .max(100, 'externalId muito longo')
    .regex(/^[a-zA-Z0-9._-]+$/, 'externalId com caracteres inválidos'),
});
