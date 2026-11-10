import type { MetricsSnapshotRepository } from '../analytics/metrics-snapshot.repository.js';
import type { ReportFilters } from './reports.schema.js';
import type { Report } from './types/reports.types.js';
import { createReportPdf } from './reports.pdf.js';

export class ReportsService {
    constructor(private readonly snapshots: MetricsSnapshotRepository) {}

    async preview({
        title,
        serviceIds,
        range,
        metrics,
        visualization,
        end,
    }: ReportFilters): Promise<Report> {
        return {
            ...(await this.snapshots.load(range, serviceIds, end ? new Date(end) : undefined)),
            title: title || 'Relatório de métricas',
            metrics,
            visualization,
        };
    }

    async exportPdf(filters: ReportFilters) {
        return createReportPdf(await this.preview(filters));
    }
}
