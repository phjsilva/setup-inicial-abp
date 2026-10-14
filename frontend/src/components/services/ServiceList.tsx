import { Link as RouterLink, useNavigate } from 'react-router';
import { ServiceStatusBadge } from '@/components/services/ServiceStatusBadge';
import { formatDateTime, formatNumber } from '@/lib/format';
import type { ServiceSummary } from '@/types/service';

interface ServiceListProps {
    services: ServiceSummary[];
}

const headClass = 'px-3 py-2 text-left font-medium whitespace-nowrap';
const numHeadClass = 'px-3 py-2 text-right font-medium whitespace-nowrap';
const cellClass = 'px-3 py-2 whitespace-nowrap';
const numCellClass = 'px-3 py-2 text-right whitespace-nowrap tabular-nums';

export function ServiceList({ services }: ServiceListProps) {
    const navigate = useNavigate();
    return (
        <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-foreground/10">
            <table className="w-full text-sm">
                <caption className="sr-only">Serviços monitorados</caption>
                <thead className="border-b text-muted-foreground">
                    <tr>
                        <th className={headClass}>Nome</th>
                        <th className={headClass}>Estado</th>
                        <th className={headClass}>Região</th>
                        <th className={headClass}>País</th>
                        <th className={headClass}>Cidade</th>
                        <th className={numHeadClass}>CPU</th>
                        <th className={numHeadClass}>Memória</th>
                        <th className={numHeadClass}>Disco</th>
                        <th className={numHeadClass}>Rede</th>
                        <th className={numHeadClass}>Energia</th>
                        <th className={numHeadClass}>CO₂e</th>
                        <th className={headClass}>Visto por último</th>
                        <th className={headClass}>Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {services.map((service) => (
                        <tr
                            key={service.id}
                            onClick={() => navigate(`/servicos/${service.id}`)}
                            className="cursor-pointer hover:bg-white/5"
                        >
                            <td className={cellClass}>
                                <strong className="font-semibold">{service.name}</strong>
                                <div className="font-mono text-xs text-muted-foreground">
                                    {service.id}
                                </div>
                            </td>
                            <td className={cellClass}>
                                <ServiceStatusBadge status={service.status} />
                                {service.active === false && (
                                    <div className="mt-1 text-xs text-muted-foreground">
                                        Não listado
                                    </div>
                                )}
                            </td>
                            <td className={cellClass}>{service.location.regionCode}</td>
                            <td className={cellClass}>{service.location.country}</td>
                            <td className={cellClass}>{service.location.city ?? '—'}</td>
                            <td className={numCellClass}>
                                {formatNumber(service.metrics?.cpuPercent, '%')}
                            </td>
                            <td className={numCellClass}>
                                {formatNumber(service.metrics?.memoryGb, 'GB')}
                            </td>
                            <td className={numCellClass}>
                                {formatNumber(service.metrics?.diskGb, 'GB')}
                            </td>
                            <td className={numCellClass}>
                                {formatNumber(service.metrics?.networkGb, 'GB')}
                            </td>
                            <td className={numCellClass}>
                                {formatNumber(service.environmental?.energyKwh, 'kWh', 5)}
                            </td>
                            <td className={numCellClass}>
                                {formatNumber(service.environmental?.co2eGrams, 'g', 3)}
                            </td>
                            <td className={cellClass}>{formatDateTime(service.lastSeenAt)}</td>
                            <td className={cellClass}>
                                <RouterLink
                                    to={`/servicos/${service.id}`}
                                    className="font-medium text-primary hover:underline"
                                >
                                    Detalhes
                                </RouterLink>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
