export interface SegmentedControlOption<T extends string> {
    value: T;
    label: string;
}

interface SegmentedControlProps<T extends string> {
    label: string;
    value: T;
    options: readonly SegmentedControlOption<T>[];
    onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
    label,
    value,
    options,
    onChange,
}: SegmentedControlProps<T>) {
    return (
        <div
            role="group"
            aria-label={label}
            className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-full border border-border bg-background/60 p-1"
        >
            {options.map((option) => {
                const selected = option.value === value;

                return (
                    <button
                        key={option.value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => onChange(option.value)}
                        className={`min-h-9 rounded-full px-3 py-1.5 text-sm whitespace-nowrap transition-colors ${
                            selected
                                ? 'bg-primary/15 font-semibold text-primary'
                                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                        }`}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
