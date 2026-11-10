import { Badge } from '@/components/ui/badge';
import { statusMeta } from '../../utils/status';

const toneStyles: Record<string, string> = {
    good: 'border-[var(--color-status-good)] text-[var(--color-status-good)]',
    warning: 'border-[var(--color-status-warning)] text-[var(--color-status-warning)]',
    critical: 'border-[var(--color-status-critical)] text-[var(--color-status-critical)]',
    neutral: 'border-[var(--color-text-muted)] text-[var(--color-text-muted)]',
};

export function StatusBadge({ status }: { status: string }) {
    const meta = statusMeta(status);

    return (
        <Badge
            variant="outline"
            className={`gap-[6px] rounded-full px-[10px] py-[2px] text-sm font-semibold whitespace-nowrap ${
                toneStyles[meta.tone] ?? toneStyles.neutral
            }`}
        >
            <span aria-hidden="true">{meta.icon}</span>
            {meta.label}
        </Badge>
    );
}
