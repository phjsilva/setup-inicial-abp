import { request, requestJson } from '@/api/authenticated';
import type { Report, ReportFilters } from '@/types/report';

export function previewReport(filters: ReportFilters, token: string) {
    return requestJson<Report>('/reports/preview', { token, method: 'POST', body: filters });
}

export async function downloadReport(filters: ReportFilters, token: string) {
    const response = await request('/reports/pdf', { token, method: 'POST', body: filters });
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = url;
    link.download = 'GreenER-relatorio.pdf';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
