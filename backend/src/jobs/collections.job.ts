import { runCollectionRound } from '../modules/collections/collections.service.js';
import { monitoringService } from '../modules/monitoring/monitoring.service.js';

const DEFAULT_INTERVAL_SECONDS = 30;

let timer: NodeJS.Timeout | undefined;
let started = false;
let session = 0;

function intervalMs(): number {
    const parsed = Number(process.env.COLLECTION_INTERVAL_SECONDS);
    const seconds = Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_INTERVAL_SECONDS;
    return seconds * 1000;
}

async function tick(): Promise<void> {
    const currentSession = session;
    timer = undefined;
    monitoringService.startRound(intervalMs() / 1000);
    console.log('[collection] rodada iniciada');
    try {
        const collected = await runCollectionRound();
        console.log(`[collection] rodada concluída: ${collected} serviço(s) coletado(s)`);
    } catch (err) {
        monitoringService.recordRoundFailure();
        console.error('[collection] rodada abortada:', err);
    } finally {
        monitoringService.finishRound(
            started && currentSession === session ? intervalMs() / 1000 : null,
        );
        if (started && currentSession === session) {
            timer = setTimeout(tick, intervalMs());
        }
    }
}

export function startCollectionJob(): void {
    if (started) return;
    started = true;
    void tick();
}

export function stopCollectionJob(): void {
    started = false;
    session += 1;
    monitoringService.clearNextCollection();
    if (timer) {
        clearTimeout(timer);
        timer = undefined;
    }
}
