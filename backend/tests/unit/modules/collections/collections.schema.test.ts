import { describe, it, expect } from 'vitest';
import { listCollectionStatusesQuerySchema } from '../../../../src/modules/collections/collections.schema.js';

describe('Validação de entradas (collections)', () => {
    it('deve rejeitar página zero', () => {
        const result = listCollectionStatusesQuerySchema.safeParse({ page: '0', limit: '20' });

        expect(result.success).toBe(false);
        expect(result.error?.issues).toEqual(
            expect.arrayContaining([expect.objectContaining({ path: ['page'] })]),
        );
    });
});
