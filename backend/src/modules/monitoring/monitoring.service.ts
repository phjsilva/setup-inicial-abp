import type { DependencyStatus, MonitoringData, MonitoringStatus } from './monitoring.types.js';

export class MonitoringService {
    private readonly data: MonitoringData = {
        running: false,
        collectionIntervalSeconds: 30,
        lastRoundStartedAt: null,
        lastRoundFinishedAt: null,
        nextCollectionAt: null,
        lastSuccessfulCollectionAt: null,
        lastRound: null,
        dependencies: {
            metricsDiscovery: 'unknown',
            carbon: 'unknown',
            database: 'unknown',
        },
    };

    private attemptedServices = 0;
    private collectedServices = 0;
    private hadFailures = false;

    constructor() {
        const seconds = Number(process.env.COLLECTION_INTERVAL_SECONDS);
        this.data.collectionIntervalSeconds =
            Number.isFinite(seconds) && seconds > 0 ? seconds : 30;
    }

    getStatus(): MonitoringStatus {
        return {
            serverTime: new Date().toISOString(),
            ...this.data,
            lastRound: this.data.lastRound ? { ...this.data.lastRound } : null,
            dependencies: { ...this.data.dependencies },
        };
    }

    startRound(intervalSeconds: number): void {
        this.data.running = true;
        this.data.collectionIntervalSeconds = intervalSeconds;
        this.data.lastRoundStartedAt = new Date().toISOString();
        this.data.nextCollectionAt = null;
        this.attemptedServices = 0;
        this.collectedServices = 0;
        this.hadFailures = false;
    }

    recordDependency(
        dependency: keyof MonitoringData['dependencies'],
        status: DependencyStatus,
    ): void {
        this.data.dependencies[dependency] = status;
        if (status === 'unavailable') this.hadFailures = true;
    }

    recordRoundFailure(): void {
        this.hadFailures = true;
    }

    recordAttemptedServices(count: number): void {
        this.attemptedServices = count;
    }

    recordSuccessfulCollection(collectedAt: Date): void {
        this.collectedServices += 1;
        const timestamp = collectedAt.toISOString();
        if (
            this.data.lastSuccessfulCollectionAt === null ||
            timestamp > this.data.lastSuccessfulCollectionAt
        ) {
            this.data.lastSuccessfulCollectionAt = timestamp;
        }
    }

    finishRound(nextIntervalSeconds: number | null): void {
        const finishedAt = new Date();
        const failedServices = Math.max(0, this.attemptedServices - this.collectedServices);
        const failed = this.hadFailures || failedServices > 0;

        this.data.running = false;
        if (nextIntervalSeconds !== null) {
            this.data.collectionIntervalSeconds = nextIntervalSeconds;
        }
        this.data.lastRoundFinishedAt = finishedAt.toISOString();
        this.data.nextCollectionAt =
            nextIntervalSeconds === null
                ? null
                : new Date(finishedAt.getTime() + nextIntervalSeconds * 1000).toISOString();
        this.data.lastRound = {
            outcome: failed ? (this.collectedServices > 0 ? 'partial' : 'failed') : 'success',
            attemptedServices: this.attemptedServices,
            collectedServices: this.collectedServices,
            failedServices,
        };
    }

    clearNextCollection(): void {
        this.data.nextCollectionAt = null;
    }
}

// O job e a rota usam esta mesma instância para compartilhar os dados da execução.
export const monitoringService = new MonitoringService();
