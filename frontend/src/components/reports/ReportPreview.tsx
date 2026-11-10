import type { ReactNode } from 'react';
import { metricValue } from '@/lib/metric-format';
import { reportMetrics } from './reportMetrics';
import { MetricBarChart } from '@/components/charts/MetricBarChart';
import { TimeSeriesChart } from '@/components/charts/TimeSeriesChart';
import { formatDateTime } from '@/lib/format';
import type { Report } from '@/types/report';

function SummaryTable({ report }: { report: Report }) {
    return (
        <div className="overflow-x-auto">
            <table className="gs-table">
                <thead>
                    <tr>
                        <th scope="col">Serviço</th>
                        <th scope="col">Amostras</th>
                        {report.metrics.map((key) => (
                            <th scope="col" key={key}>
                                {reportMetrics[key].label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {report.services.map((service) => (
                        <tr key={service.id}>
                            <th scope="row">{service.name}</th>
                            <td>{service.samples.toLocaleString('pt-BR')}</td>
                            {report.metrics.map((key) => (
                                <td key={key}>
                                    {metricValue(service[key], reportMetrics[key].unit)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function ReportPreview({ report, children }: { report: Report; children: ReactNode }) {
    const samples = report.services.reduce((sum, service) => sum + service.samples, 0);
    return (
        <div className="space-y-5">
            <header className="gs-summary-panel space-y-3">
                <h3 className="break-words text-xl font-semibold">{report.title}</h3>
                <p className="text-sm text-muted-foreground">
                    {formatDateTime(report.start)} a {formatDateTime(report.end)}
                </p>
                <dl className="gs-report-stats">
                    <div>
                        <dt>Serviços</dt>
                        <dd>{report.services.length}</dd>
                    </div>
                    <div>
                        <dt>Amostras</dt>
                        <dd>{samples.toLocaleString('pt-BR')}</dd>
                    </div>
                    <div>
                        <dt>Métricas</dt>
                        <dd>{report.metrics.length}</dd>
                    </div>
                </dl>
            </header>
            {children}
            {samples === 0 && (
                <p className="gs-notice" role="status">
                    Nenhum dos serviços tem amostras no período.
                </p>
            )}
            {report.visualization !== 'table' &&
                report.metrics.map((metric) => {
                    const { label, unit } = reportMetrics[metric];
                    const points = report.points.flatMap((point) =>
                        point[metric] === null ? [] : [{ time: point.time, value: point[metric] }],
                    );
                    const bars = report.services.map((service) => ({
                        id: service.id,
                        name: service.name,
                        value: service[metric],
                    }));
                    return (
                        <section key={metric} className="gs-report-chart">
                            <h3 className="mb-3 font-semibold">{label}</h3>
                            {report.visualization === 'line' ? (
                                <TimeSeriesChart
                                    data={points}
                                    label={label}
                                    color="#34d399"
                                    formatValue={(value) => metricValue(value, unit)}
                                    responsive
                                />
                            ) : (
                                <MetricBarChart data={bars} label={label} unit={unit} />
                            )}
                        </section>
                    );
                })}
            <SummaryTable report={report} />
        </div>
    );
}
