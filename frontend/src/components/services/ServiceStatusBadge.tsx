import { statusInfo } from '@/lib/serviceStatus';
import type { ServiceStatus } from '@/types/service';

interface ServiceStatusBadgeProps {
    status: ServiceStatus;
}

export function ServiceStatusBadge({ status }: ServiceStatusBadgeProps) {
    const info = statusInfo[status];

    return (
        <span
            title={info.description}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium whitespace-nowrap ${info.className}`}
        >
            <span aria-hidden="true">{info.icon}</span>
            {info.label}
        </span>
    );
}
