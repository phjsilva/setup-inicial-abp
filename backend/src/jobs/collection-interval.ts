import { pool } from '../db/connection.js';
import { ProjectRepository } from '../modules/project/project.repository.js';

const settings = new ProjectRepository(pool);

export function fallbackInterval() {
    const seconds = Number(process.env.COLLECTION_INTERVAL_SECONDS);
    return Number.isFinite(seconds) && seconds > 0 ? seconds : 30;
}

export async function readCollectionInterval(previous: number): Promise<number> {
    try {
        return (await settings.getInterval()) ?? fallbackInterval();
    } catch (error) {
        console.error('[collection] Não foi possível ler o intervalo persistido:', error);
        return previous;
    }
}
