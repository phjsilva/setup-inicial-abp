import { SegmentedControl } from '@/components/shared/SegmentedControl';
import {
    HISTORY_RANGE_OPTIONS,
    IMPACT_METRIC_OPTIONS,
} from '@/components/shared/segmentedControlOptions';
import type { RankingCriterion } from '@/types/ranking';
import type { HistoryRange } from '@/types/service';

interface RankingFiltersProps {
    criterion: RankingCriterion;
    range: HistoryRange;
    onCriterionChange: (criterion: RankingCriterion) => void;
    onRangeChange: (range: HistoryRange) => void;
}

export function RankingFilters({
    criterion,
    range,
    onCriterionChange,
    onRangeChange,
}: RankingFiltersProps) {
    return (
        <section
            aria-label="Filtros do ranking"
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
            <SegmentedControl
                label="Critério do ranking"
                value={criterion}
                options={IMPACT_METRIC_OPTIONS}
                onChange={onCriterionChange}
            />
            <SegmentedControl
                label="Período do ranking"
                value={range}
                options={HISTORY_RANGE_OPTIONS}
                onChange={onRangeChange}
            />
        </section>
    );
}
