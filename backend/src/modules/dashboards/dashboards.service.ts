import { AppError } from '../../shared/errors/AppError.js';
import type { MetricsSnapshotRepository } from '../analytics/metrics-snapshot.repository.js';
import type { DashboardsRepository } from './dashboards.repository.js';
import type { DashboardInput, DashboardMetricsQuery } from './dashboards.schema.js';

export class DashboardsService {
    constructor(
        private readonly repository: DashboardsRepository,
        private readonly snapshots: MetricsSnapshotRepository,
    ) {}
    list(userId: string) {
        return this.repository.list(userId);
    }
    metrics({ range }: DashboardMetricsQuery) {
        return this.snapshots.load(range);
    }
    create(userId: string, data: DashboardInput) {
        return this.repository.create(userId, data);
    }
    async update(id: string, userId: string, data: DashboardInput) {
        const dashboard = await this.repository.update(id, userId, data);
        if (!dashboard) throw new AppError('Dashboard não encontrado.', 404);
        return dashboard;
    }
}
