import type { SegmentedControlOption } from './SegmentedControl';
import type { RankingCriterion } from '@/types/ranking';
import type { HistoryRange } from '@/types/service';

export const HISTORY_RANGE_OPTIONS: readonly SegmentedControlOption<HistoryRange>[] = [
    { value: '1h', label: '1h' },
    { value: '6h', label: '6h' },
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
];

export const IMPACT_METRIC_OPTIONS: readonly SegmentedControlOption<RankingCriterion>[] = [
    { value: 'co2eGrams', label: 'Emissão (CO₂e)' },
    { value: 'energyKwh', label: 'Energia' },
];
