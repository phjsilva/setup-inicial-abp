import type { Emissions, EstimateParameter, ProcessedMetrics } from './types/collections.types.js';

export function calculateEmissions(
    m: Pick<
        ProcessedMetrics,
        'cpuPercent' | 'memoryGb' | 'diskGb' | 'networkGb' | 'collectionIntervalHours'
    >,
    p: Omit<EstimateParameter, 'id' | 'active'>,
    carbonIntensity: number,
): Emissions {
    const cpuWatts = (m.cpuPercent / 100) * p.cpu_max_watts;
    const memoryWatts = m.memoryGb * p.ram_watts_per_gb;
    const diskWatts = m.diskGb * p.disk_watts_per_gb;
    const networkWatts = m.networkGb * p.network_watts_per_gb;
    const powerW = cpuWatts + memoryWatts + diskWatts + networkWatts;
    const energyKwh = (powerW * m.collectionIntervalHours) / 1000;
    const co2eG = energyKwh * carbonIntensity;

    return { cpuWatts, memoryWatts, diskWatts, networkWatts, powerW, energyKwh, co2eG };
}
