import { describe, it, expect } from 'vitest';
import { listRankingsQuerySchema } from '../../../../src/modules/rankings/rankings.schema.js';

describe('Validação de entradas (rankings)', () => {
    it('deve rejeitar um período não permitido', () => {
        const result = listRankingsQuerySchema.safeParse({ range: '2h' });

        expect(result.success).toBe(false);
        expect(result.error?.issues).toEqual(
            expect.arrayContaining([expect.objectContaining({ path: ['range'] })]),
        );
    });
});
