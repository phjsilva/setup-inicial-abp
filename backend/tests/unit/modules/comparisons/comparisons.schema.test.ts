import { describe, it, expect } from 'vitest';
import { createComparisonSchema } from '../../../../src/modules/comparisons/comparisons.schema.js';

describe('Validação de entradas (comparisons)', () => {
    it('deve rejeitar uma comparação com menos de dois serviços', () => {
        const result = createComparisonSchema.safeParse({
            range: '24h',
            selections: [{ selectionId: 'a', externalId: 'service-a', simulatedRegionCode: null }],
        });

        expect(result.success).toBe(false);
        expect(result.error?.issues).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    path: ['selections'],
                    message: 'Selecione pelo menos dois serviços',
                }),
            ]),
        );
    });

    it('deve rejeitar uma comparação com mais de cinco serviços', () => {
        const selections = Array.from({ length: 6 }, (_, index) => ({
            selectionId: `selection-${index}`,
            externalId: `service-${index}`,
            simulatedRegionCode: null,
        }));
        const result = createComparisonSchema.safeParse({ range: '24h', selections });

        expect(result.success).toBe(false);
        expect(result.error?.issues).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    path: ['selections'],
                    message: 'Selecione no máximo cinco serviços',
                }),
            ]),
        );
    });
});
