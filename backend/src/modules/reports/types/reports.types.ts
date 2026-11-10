import type { MetricsSnapshot } from '../../analytics/types/metrics-snapshot.types.js';
import type { ReportFilters } from '../reports.schema.js';

export type Report = MetricsSnapshot &
    Pick<ReportFilters, 'metrics' | 'visualization'> & { title: string };
