import { getJson } from '@/api/services';
import type { MonitoringStatus } from '@/types/monitoring';

export function fetchMonitoringStatus(): Promise<MonitoringStatus> {
    return getJson<MonitoringStatus>('/monitoring/status');
}
