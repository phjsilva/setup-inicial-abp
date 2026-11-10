import { z } from 'zod';

export const coefficientsSchema = z.object({
    cpuMaxWatts: z.number().min(0).max(999999.9999),
    ramWattsPerGb: z.number().min(0).max(999999.9999),
    diskWattsPerGb: z.number().min(0).max(999999.9999),
    networkWattsPerGb: z.number().min(0).max(999999.9999),
});
export const collectionSettingsSchema = z.object({
    intervalSeconds: z.number().int().min(10).max(3600),
});
export const memberIdSchema = z.object({ id: z.string().regex(/^[1-9][0-9]{0,17}$/) });
export const membersQuerySchema = z.object({
    search: z.string().trim().max(100).default(''),
    active: z.enum(['true', 'false']).optional(),
});
export const memberAccessSchema = z.object({
    role: z.enum(['admin', 'visualizador']),
    active: z.boolean(),
});
export type CoefficientsInput = z.infer<typeof coefficientsSchema>;
export type MembersQuery = z.infer<typeof membersQuerySchema>;
export type MemberAccess = z.infer<typeof memberAccessSchema>;
