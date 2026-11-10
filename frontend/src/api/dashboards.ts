import { requestJson } from '@/api/authenticated';
import type { Dashboard, DashboardDraft } from '@/types/dashboard';
import type { Snapshot } from '@/types/metrics';
import type { HistoryRange } from '@/types/service';

export function fetchDashboards(token: string, signal?: AbortSignal) {
    return requestJson<Dashboard[]>('/dashboards', { token, signal });
}
export function fetchDashboardMetrics(range: HistoryRange, token: string) {
    return requestJson<Snapshot>('/dashboards/data?' + new URLSearchParams({ range }), { token });
}
export function saveDashboard(body: DashboardDraft, token: string, id?: string) {
    return requestJson<Dashboard>(id ? '/dashboards/' + encodeURIComponent(id) : '/dashboards', {
        token,
        method: id ? 'PATCH' : 'POST',
        body,
    });
}
