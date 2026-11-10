import { statusMeta, type StatusMeta } from './status';

const TONE_STYLE: Record<StatusMeta['tone'], { color: string; badge: string }> = {
    good: { color: '#22c55e', badge: 'bg-emerald-400/15 text-emerald-300' },
    warning: { color: '#f59e0b', badge: 'bg-amber-400/15 text-amber-300' },
    critical: { color: '#ef4444', badge: 'bg-red-400/15 text-red-300' },
    neutral: { color: '#94a3b8', badge: 'bg-slate-400/15 text-slate-300' },
};

export function statusStyle(status: string) {
    return TONE_STYLE[statusMeta(status).tone];
}
