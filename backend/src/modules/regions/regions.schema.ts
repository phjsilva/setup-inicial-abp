import { z } from 'zod';

const isoDateTimeSchema = z.iso.datetime({
    offset: true,
    error: 'deve ser uma data ISO 8601 com fuso',
});

export const listRegionsQuerySchema = z
    .object({
        from: isoDateTimeSchema.optional(),
        to: isoDateTimeSchema.optional(),
    })
    .strict()
    .superRefine((data, ctx) => {
        const hasFrom = data.from !== undefined;
        const hasTo = data.to !== undefined;

        if (hasFrom !== hasTo) {
            ctx.addIssue({
                code: 'custom',
                message: 'from e to devem ser enviados juntos',
                path: [hasFrom ? 'from' : 'to'],
            });
            return;
        }

        if (hasFrom && hasTo && new Date(data.from!).getTime() >= new Date(data.to!).getTime()) {
            ctx.addIssue({
                code: 'custom',
                message: 'from deve ser anterior a to',
                path: ['from'],
            });
        }
    })
    .transform((data) => ({
        from: data.from === undefined ? undefined : new Date(data.from),
        to: data.to === undefined ? undefined : new Date(data.to),
    }));

export type RegionsQuery = z.output<typeof listRegionsQuerySchema>;
