// Formato de GET /api/v1/monitoring/status.
export type DependencyStatus = 'available' | 'unavailable' | 'unknown';

export interface MonitoringStatus {
    serverTime: string;
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
