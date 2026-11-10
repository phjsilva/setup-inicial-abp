import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { startCollectionJob, stopCollectionJob } from '../../../src/jobs/collections.job.js';
import { readCollectionInterval } from '../../../src/jobs/collection-interval.js';
import { runCollectionRound } from '../../../src/modules/collections/collections.service.js';

vi.mock('../../../src/modules/collections/collections.service.js', () => ({
    runCollectionRound: vi.fn(),
}));
vi.mock('../../../src/jobs/collection-interval.js', () => ({
    fallbackInterval: () => 30,
    readCollectionInterval: vi.fn(),
}));

describe('Rotina periódica de coletas (collections.job)', () => {
    beforeEach(() => {
        vi.stubEnv('COLLECTION_INTERVAL_SECONDS', '30');
        vi.useFakeTimers();
        vi.clearAllMocks();
        vi.mocked(readCollectionInterval).mockResolvedValue(30);
    });

    afterEach(() => {
        stopCollectionJob();
        vi.useRealTimers();
        vi.unstubAllEnvs();
        vi.useRealTimers();
    });

    it('deve realizar múltiplas coletas periodicamente sem depender de reinicialização da aplicação', async () => {
        vi.mocked(runCollectionRound).mockResolvedValue(1);

        startCollectionJob();
        await vi.advanceTimersByTimeAsync(0);

        // Inicia coletas
        expect(runCollectionRound).toHaveBeenCalledTimes(1);

        await vi.advanceTimersByTimeAsync(30_000);

        expect(runCollectionRound).toHaveBeenCalledTimes(2);

        await vi.advanceTimersByTimeAsync(30_000);
        expect(runCollectionRound).toHaveBeenCalledTimes(3);
    });

    it('deve interromper o agendamento de novas coletas quando stopCollectionJob for chamado', async () => {
        vi.mocked(runCollectionRound).mockResolvedValue(1);

        startCollectionJob();
        await vi.advanceTimersByTimeAsync(0);
        expect(runCollectionRound).toHaveBeenCalledTimes(1);

        stopCollectionJob();

        await vi.advanceTimersByTimeAsync(60_000);
        expect(runCollectionRound).toHaveBeenCalledTimes(1);
    });

    it('usa o intervalo persistido mais recente para agendar a rodada seguinte', async () => {
        vi.mocked(readCollectionInterval).mockResolvedValueOnce(30).mockResolvedValue(10);
        vi.mocked(runCollectionRound).mockResolvedValue(1);

        startCollectionJob();
        await vi.advanceTimersByTimeAsync(9_999);
        expect(runCollectionRound).toHaveBeenCalledTimes(1);
        await vi.advanceTimersByTimeAsync(1);
        expect(runCollectionRound).toHaveBeenCalledTimes(2);
    });
});
