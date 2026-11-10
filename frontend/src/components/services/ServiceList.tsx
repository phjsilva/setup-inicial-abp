import { Link as RouterLink, useNavigate } from 'react-router';
import { ServiceStatusBadge } from '@/components/services/ServiceStatusBadge';
import { formatDateTime, formatNumber } from '@/lib/format';
import type { ServiceSummary } from '@/types/service';

interface ServiceListProps {
    services: ServiceSummary[];
}

const headClass =
    'px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap';

const numHeadClass =
    'px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap';

const cellClass = 'px-4 py-4 align-middle whitespace-nowrap';
const numCellClass = 'px-4 py-4 text-right align-middle whitespace-nowrap tabular-nums';

export function ServiceList({ services }: ServiceListProps) {
    const navigate = useNavigate();

    return (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-card shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-sm">
                    <caption className="sr-only">Serviços monitorados</caption>

                    <thead className="border-b border-white/10 bg-white/[0.035]">
                        <tr>
                            <th scope="col" className={headClass}>
                                Serviço
                            </th>
                            <th scope="col" className={headClass}>
                                Estado
                            </th>
                            <th scope="col" className={headClass}>
                                Localização
                            </th>
                            <th scope="col" className={numHeadClass}>
                                CPU
                            </th>
                            <th scope="col" className={numHeadClass}>
                                Memória
                            </th>
                            <th scope="col" className={numHeadClass}>
                                Disco
                            </th>
                            <th scope="col" className={numHeadClass}>
                                Rede
                            </th>
                            <th scope="col" className={numHeadClass}>
                                Energia
                            </th>
                            <th scope="col" className={numHeadClass}>
                                CO₂e
                            </th>
                            <th scope="col" className={headClass}>
                                Visto por último
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-white/[0.06]">
                        {services.map((service) => (
                            <tr
                                key={service.id}
                                onClick={() => navigate(`/servicos/${service.id}`)}
                                className="cursor-pointer transition-colors duration-150 hover:bg-white/[0.035]"
                            >
                                <td className={cellClass}>
                                    <RouterLink
                                        to={`/servicos/${service.id}`}
                                        onClick={(event) => event.stopPropagation()}
                                        className="font-semibold text-foreground transition-colors hover:text-emerald-300 hover:underline"
                                    >
                                        {service.name}
                                    </RouterLink>

                                    <div className="mt-1 font-mono text-xs text-muted-foreground">
                                        {service.id}
                                    </div>
                                </td>

                                <td className={cellClass}>
                                    <ServiceStatusBadge status={service.status} />

                                    {service.active === false && (
                                        <div className="mt-1.5 text-xs text-muted-foreground">
                                            Não listado
                                        </div>
                                    )}
                                </td>

                                <td className={cellClass}>
                                    {service.location ? (
                                        <>
                                            <span className="text-foreground/90">
                                                {[service.location.city, service.location.country]
                                                    .filter(Boolean)
                                                    .join(', ')}
                                            </span>

                                            <div className="mt-1 font-mono text-xs text-muted-foreground">
                                                {service.location.regionCode}
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-muted-foreground">—</span>
                                    )}
                                </td>

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

                                <td
                                    className={`${cellClass} whitespace-pre-line text-muted-foreground`}
                                >
                                    {formatDateTime(service.lastSeenAt).replace(', ', '\n')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
