import { useEffect, useId, useRef, useState, type MouseEvent } from 'react';
import { formatDateTime, formatTime } from '@/lib/format';

export interface TimeSeriesPoint {
    time: string;
    value: number;
}

interface TimeSeriesChartProps {
    data: TimeSeriesPoint[];
    label: string;
    color: string;
    formatValue: (value: number) => string;
    responsive?: boolean;
}

const TOOLTIP = { width: 190, height: 60 };

export function TimeSeriesChart({
    data,
    label,
    color,
    formatValue,
    responsive = false,
}: TimeSeriesChartProps) {
    const gradientId = `grad-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
    const [hovered, setHovered] = useState<number | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const [width, setWidth] = useState(600);
    const hasData = data.length > 0;

    useEffect(() => {
        if (!responsive || !hasData || !svgRef.current) return;
        const observer = new ResizeObserver(([entry]) => {
            if (entry.contentRect.width)
                setWidth(Math.max(220, Math.round(entry.contentRect.width)));
        });
        observer.observe(svgRef.current);
        return () => observer.disconnect();
    }, [hasData, responsive]);

    if (!hasData) {
        return <p className="text-sm text-muted-foreground">Sem dados no período.</p>;
    }

    const WIDTH = responsive ? width : 600;
    const compact = responsive && WIDTH < 480;
    const HEIGHT = compact ? 174 : 220;
    const PAD = { top: 12, right: 12, bottom: compact ? 26 : 32, left: compact ? 76 : 96 };
    const INNER_WIDTH = WIDTH - PAD.left - PAD.right;
    const INNER_HEIGHT = HEIGHT - PAD.top - PAD.bottom;
    const values = data.map((point) => point.value);
    const max = Math.max(...values);
    const low = 0;
    const high = max > 0 ? max * 1.1 : 1;
    const startTime = new Date(data[0].time).getTime();
    const endTime = new Date(data[data.length - 1].time).getTime();

    const x = (index: number) =>
        PAD.left +
        (endTime === startTime
            ? 0.5
            : (new Date(data[index].time).getTime() - startTime) / (endTime - startTime)) *
            INNER_WIDTH;
    const y = (value: number) => PAD.top + (1 - (value - low) / (high - low)) * INNER_HEIGHT;

    const line = data.map((point, index) => `${x(index)},${y(point.value)}`).join(' ');
    const bottom = PAD.top + INNER_HEIGHT;
    const area = `${x(0)},${bottom} ${line} ${x(data.length - 1)},${bottom}`;

    const yTicks = compact
        ? [low, high / 2, high]
        : [low, high / 4, high / 2, (high * 3) / 4, high];
    const xTicks = [
        ...new Set([
            0,
            ...(compact ? [] : [Math.floor((data.length - 1) / 4)]),
            Math.floor((data.length - 1) / 2),
            ...(compact ? [] : [Math.floor(((data.length - 1) * 3) / 4)]),
            data.length - 1,
        ]),
    ];

    // Converte a posição do mouse (em pixels da tela) no índice do ponto mais próximo.
    function handleMouseMove(event: MouseEvent<SVGSVGElement>) {
        const rect = event.currentTarget.getBoundingClientRect();
        const svgX = ((event.clientX - rect.left) / rect.width) * WIDTH;
        const time = startTime + ((svgX - PAD.left) / INNER_WIDTH) * (endTime - startTime);
        const index = data.reduce(
            (nearest, item, i) =>
                Math.abs(new Date(item.time).getTime() - time) <
                Math.abs(new Date(data[nearest].time).getTime() - time)
                    ? i
                    : nearest,
            0,
        );
        setHovered(Math.min(data.length - 1, Math.max(0, index)));
    }

    const selected = hovered !== null && hovered < data.length ? hovered : null;
    const point = selected === null ? null : data[selected];
    const pointX = selected === null ? 0 : x(selected);
    const pointY = point ? y(point.value) : 0;
    // A caixa fica à direita do ponto, ou à esquerda quando não cabe.
    const tooltipX = Math.max(
        2,
        pointX + 12 + TOOLTIP.width > WIDTH ? pointX - 12 - TOOLTIP.width : pointX + 12,
    );
    const tooltipY = Math.min(
        Math.max(pointY - TOOLTIP.height / 2, PAD.top),
        bottom - TOOLTIP.height,
    );

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            role="img"
            aria-label={label}
            className="h-auto w-full"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHovered(null)}
            onClick={responsive ? handleMouseMove : undefined}
            tabIndex={responsive ? 0 : undefined}
            onBlur={responsive ? () => setHovered(null) : undefined}
            onKeyDown={
                responsive
                    ? (event) => {
                          if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
                          event.preventDefault();
                          const direction = event.key === 'ArrowLeft' ? -1 : 1;
                          setHovered((previous) =>
                              Math.max(
                                  0,
                                  Math.min(
                                      data.length - 1,
                                      previous === null ? 0 : previous + direction,
                                  ),
                              ),
                          );
                      }
                    : undefined
            }
        >
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.35 }} />
                    <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
                </linearGradient>
            </defs>

            {yTicks.map((tick) => (
                <g key={tick}>
                    <line
                        x1={PAD.left}
                        x2={WIDTH - PAD.right}
                        y1={y(tick)}
                        y2={y(tick)}
                        className="stroke-white/10"
                    />
                    <text
                        x={PAD.left - 8}
                        y={y(tick)}
                        textAnchor="end"
                        dominantBaseline="middle"
                        className="fill-muted-foreground text-[12px]"
                    >
                        {formatValue(tick)}
                    </text>
                </g>
            ))}

            {xTicks.map((index) => (
                <text
                    key={index}
                    x={x(index)}
                    y={HEIGHT - 6}
                    textAnchor={
                        index === 0 ? 'start' : index === data.length - 1 ? 'end' : 'middle'
                    }
                    className="fill-muted-foreground text-[12px]"
                >
                    {endTime - startTime >= 86400000
                        ? formatDateTime(data[index].time).slice(0, 5)
                        : formatTime(data[index].time)}
                </text>
            ))}

            <polygon points={area} style={{ fill: `url(#${gradientId})` }} />
            <polyline
                points={line}
                fill="none"
                strokeWidth={2}
                strokeLinejoin="round"
                style={{ stroke: color }}
            />
            {data.length === 1 &&
                data.map((item, index) => (
                    <circle
                        key={item.time}
                        cx={x(index)}
                        cy={y(item.value)}
                        r={3}
                        style={{ fill: color }}
                    />
                ))}

            {point && (
                <g pointerEvents="none">
                    <line
                        x1={pointX}
                        x2={pointX}
                        y1={PAD.top}
                        y2={bottom}
                        className="stroke-white/30"
                        strokeDasharray="4 4"
                    />
                    <circle
                        cx={pointX}
                        cy={pointY}
                        r={7}
                        strokeWidth={3}
                        className="stroke-background"
                        style={{ fill: color }}
                    />
                    <rect
                        x={tooltipX}
                        y={tooltipY}
                        width={TOOLTIP.width}
                        height={TOOLTIP.height}
                        rx={8}
                        className="fill-popover stroke-white/15"
                    />
                    <text
                        x={tooltipX + 12}
                        y={tooltipY + 24}
                        className="fill-muted-foreground text-[13px]"
                    >
                        {formatDateTime(point.time)}
                    </text>
                    <text
                        x={tooltipX + 12}
                        y={tooltipY + 48}
                        className="fill-foreground text-[18px] font-semibold"
                    >
                        {formatValue(point.value)}
                    </text>
                </g>
            )}
        </svg>
    );
}
