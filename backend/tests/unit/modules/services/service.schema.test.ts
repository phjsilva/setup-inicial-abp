import { describe, expect, it } from 'vitest';
import { listServicesQuerySchema } from '../../../../src/modules/services/services.schema.js';

describe('listServicesQuerySchema', () => {
    it('aceita regionCode', () => {
        const result = listServicesQuerySchema.safeParse({ regionCode: 'BR-SUL' });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.regionCode).toBe('BR-SUL');
        }
    });

    it.each([
        ['true', true],
        ['false', false],
    ])('converte active=%s para boolean %s', (input, expected) => {
        const result = listServicesQuerySchema.safeParse({ active: input });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.active).toBe(expected);
        }
    });

    it('rejeita regionCode vazio', () => {
        const result = listServicesQuerySchema.safeParse({ regionCode: '' });

        expect(result.success).toBe(false);
    });

    it('rejeita active diferente de true ou false', () => {
        const result = listServicesQuerySchema.safeParse({ active: 'yes' });

        expect(result.success).toBe(false);
    });

    it('rejeita parâmetros desconhecidos', () => {
        const result = listServicesQuerySchema.safeParse({ cidade: 'São Paulo' });

        expect(result.success).toBe(false);
    });
});
