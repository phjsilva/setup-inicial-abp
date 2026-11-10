import { ServiceStatusBadge } from '@/components/services/ServiceStatusBadge';
import { statusInfo } from '@/lib/serviceStatus';
import type { ServiceStatus } from '@/types/service';

const statuses: ServiceStatus[] = ['available', 'metrics_missing', 'unavailable'];

export function StatusLegend() {
    return (
        <section aria-label="Legenda de estados">
            <h3 className="mb-4 text-center text-sm font-medium text-muted-foreground">
                Legenda de estados
            </h3>

            <dl className="grid gap-4 sm:grid-cols-3">
                {statuses.map((status) => (
                    <div key={status} className="flex flex-col items-center gap-2 text-center">
                        <dt>
                            <ServiceStatusBadge status={status} />
                        </dt>

                        <dd className="max-w-xs text-xs leading-relaxed text-muted-foreground">
                            {statusInfo[status].description}
                        </dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}
