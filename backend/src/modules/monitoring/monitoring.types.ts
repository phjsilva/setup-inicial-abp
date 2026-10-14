export type DependencyStatus = 'available' | 'unavailable' | 'unknown';

export interface MonitoringData {
    running: boolean;
    collectionIntervalSeconds: number;
    lastRoundStartedAt: string | null;
    lastRoundFinishedAt: string | null;
    nextCollectionAt: string | null;
    lastSuccessfulCollectionAt: string | null;
    lastRound: {
        outcome: 'success' | 'partial' | 'failed';
        attemptedServices: number;
        collectedServices: number;
        failedServices: number;
    } | null;
    dependencies: {
        metricsDiscovery: DependencyStatus;
        carbon: DependencyStatus;
        database: DependencyStatus;
    };
}

export interface MonitoringStatus extends MonitoringData {
    serverTime: string;
}
