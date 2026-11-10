import { runCollectionRound } from '../modules/collections/collections.service.js';
import { monitoringService } from '../modules/monitoring/monitoring.service.js';
import { fallbackInterval, readCollectionInterval } from './collection-interval.js';

let timer: NodeJS.Timeout | undefined;
let started = false;
let session = 0;
let interval = 30;

async function tick(): Promise<void> {
    const currentSession = session;
    timer = undefined;
    const currentInterval = await readCollectionInterval(interval);
    if (!started || currentSession !== session) return;
    interval = currentInterval;
    monitoringService.startRound(interval);
    console.log('[collection] rodada iniciada');
    try {
        const collected = await runCollectionRound();
        console.log(`[collection] rodada concluída: ${collected} serviço(s) coletado(s)`);
    } catch (err) {
        monitoringService.recordRoundFailure();
        console.error('[collection] rodada abortada:', err);
    } finally {
        const nextInterval =
            started && currentSession === session ? await readCollectionInterval(interval) : null;
        if (nextInterval !== null && started && currentSession === session) {
            interval = nextInterval;
            monitoringService.finishRound(interval);
            timer = setTimeout(tick, interval * 1000);
        } else if (currentSession + 1 === session && !started) {
            monitoringService.finishRound(null);
        }
    }
}

export function startCollectionJob(): void {
    if (started) return;
    started = true;
    interval = fallbackInterval();
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
