import { statusInfo } from '@/lib/serviceStatus';
import type { ServiceStatus } from '@/types/service';

interface ServiceStatusBadgeProps {
  status: ServiceStatus;
}

export function ServiceStatusBadge({ status }: ServiceStatusBadgeProps) {
  const info = statusInfo[status];

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-sm font-medium whitespace-nowrap ${info.className}`}
    >
      {info.label}
    </span>
  );
}
