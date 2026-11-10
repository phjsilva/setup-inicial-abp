import { useEffect, useMemo, useRef, useState } from 'react';
import type { Region } from '@/types/api';
import { formatIntensity } from '@/utils/format';

interface RegionsMap2DProps {
    regions: Region[];
}

interface MapPoint {
    region: Region;
    name: string;
    x: number;
    y: number;
    labelX: number;
    labelY: number;
    labelWidth: number;
    color: string;
}

interface MapSize {
    width: number;
    height: number;
}

const MAP_PADDING = 8;
const MARKER_RADIUS = 6;
const LABEL_HEIGHT = 22;
const LABEL_GAP = 5;
const LABEL_DIRECTIONS = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: -1 },
    { x: 1, y: 1 },
    { x: -1, y: 1 },
];

function regionName(region: Region): string {
    return region.city ?? region.region ?? region.code;
}

function getIntensityColor(value: number | null, min: number, max: number): string {
    if (value == null || !Number.isFinite(value)) return '#94a3b8';

    // A escala relativa vai de verde (menor intensidade) a vermelho (maior intensidade).
    const normalized = max === min ? 0.5 : (value - min) / (max - min);
    const hue = 140 * (1 - Math.max(0, Math.min(1, normalized)));
    return `hsl(${hue} 78% 52%)`;
}

function intersects(
    a: { left: number; top: number; width: number; height: number },
    b: { left: number; top: number; width: number; height: number },
): boolean {
    return (
        a.left < b.left + b.width + LABEL_GAP &&
        a.left + a.width + LABEL_GAP > b.left &&
        a.top < b.top + b.height + LABEL_GAP &&
        a.top + a.height + LABEL_GAP > b.top
    );
}

function placeLabels(regions: Region[], size: MapSize): MapPoint[] {
    if (!size.width || !size.height) return [];

    const withCoordinates = regions.flatMap((region) => {
        const { latitude, longitude } = region;
        if (
            latitude == null ||
            longitude == null ||
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
        ) {
            return [];
        }

        return [
            {
                region,
                name: regionName(region),
                x: Math.max(
                    MAP_PADDING,
                    Math.min(size.width - MAP_PADDING, (longitude / 360 + 0.5) * size.width),
                ),
                y: Math.max(
                    MAP_PADDING,
                    Math.min(size.height - MAP_PADDING, (0.5 - latitude / 180) * size.height),
                ),
                labelWidth: Math.min(156, Math.max(54, regionName(region).length * 6.5 + 16)),
            },
        ];
    });

    const values = withCoordinates
        .map(({ region }) => region.gco2ePerKwh)
        .filter((value): value is number => value != null && Number.isFinite(value));
    const min = values.length ? Math.min(...values) : 0;
    const max = values.length ? Math.max(...values) : 0;

    const positioned = withCoordinates.map((point) => ({
        ...point,
        color: getIntensityColor(point.region.gco2ePerKwh, min, max),
        neighbors: withCoordinates.filter(
            (other) =>
                other.region.code !== point.region.code &&
                Math.hypot(other.x - point.x, other.y - point.y) < 90,
        ).length,
    }));

    // Posiciona primeiro os rótulos em áreas mais densas para reduzir colisões.
    positioned.sort((a, b) => b.neighbors - a.neighbors || b.labelWidth - a.labelWidth);

    const placed: Array<MapPoint & { width: number; height: number }> = [];
    const maxOffset = Math.max(size.width, size.height);

    for (const point of positioned) {
        let best: { x: number; y: number } | undefined;

        for (let offset = 12; offset <= maxOffset && !best; offset += 14) {
            for (const direction of LABEL_DIRECTIONS) {
                const centerX = point.x + direction.x * offset;
                const centerY = point.y + direction.y * offset;
                const left =
                    direction.x < 0
                        ? centerX - point.labelWidth
                        : direction.x === 0
                          ? centerX - point.labelWidth / 2
                          : centerX;
                const top =
                    direction.y < 0
                        ? centerY - LABEL_HEIGHT
                        : direction.y === 0
                          ? centerY - LABEL_HEIGHT / 2
                          : centerY;
                const candidate = {
                    left: Math.max(
                        MAP_PADDING,
                        Math.min(size.width - point.labelWidth - MAP_PADDING, left),
                    ),
                    top: Math.max(
                        MAP_PADDING,
                        Math.min(size.height - LABEL_HEIGHT - MAP_PADDING, top),
                    ),
                    width: point.labelWidth,
                    height: LABEL_HEIGHT,
                };

                const overlapsLabel = placed.some((label) =>
                    intersects(candidate, {
                        left: label.labelX,
                        top: label.labelY,
                        width: label.width,
                        height: label.height,
                    }),
                );
                const coversAnotherMarker = positioned.some(
                    (other) =>
                        other.region.code !== point.region.code &&
                        other.x >= candidate.left - MARKER_RADIUS &&
                        other.x <= candidate.left + candidate.width + MARKER_RADIUS &&
                        other.y >= candidate.top - MARKER_RADIUS &&
                        other.y <= candidate.top + candidate.height + MARKER_RADIUS,
                );

                if (!overlapsLabel && !coversAnotherMarker) {
                    best = { x: candidate.left, y: candidate.top };
                    break;
                }
            }
        }

        // Se as posições ao redor do marcador estiverem ocupadas, procura um espaço
        // livre no mapa para manter o nome legível e sem sobrepor os outros rótulos.
        if (!best) {
            let closestDistance = Number.POSITIVE_INFINITY;
            for (
                let top = MAP_PADDING;
                top <= size.height - LABEL_HEIGHT - MAP_PADDING;
                top += 12
            ) {
                for (
                    let left = MAP_PADDING;
                    left <= size.width - point.labelWidth - MAP_PADDING;
                    left += 12
                ) {
                    const candidate = {
                        left,
                        top,
                        width: point.labelWidth,
                        height: LABEL_HEIGHT,
                    };
                    const overlapsLabel = placed.some((label) =>
                        intersects(candidate, {
                            left: label.labelX,
                            top: label.labelY,
                            width: label.width,
                            height: label.height,
                        }),
                    );
                    const coversAnotherMarker = positioned.some(
                        (other) =>
                            other.region.code !== point.region.code &&
                            other.x >= candidate.left - MARKER_RADIUS &&
                            other.x <= candidate.left + candidate.width + MARKER_RADIUS &&
                            other.y >= candidate.top - MARKER_RADIUS &&
                            other.y <= candidate.top + candidate.height + MARKER_RADIUS,
                    );
                    const distance = Math.hypot(
                        left + point.labelWidth / 2 - point.x,
                        top + LABEL_HEIGHT / 2 - point.y,
                    );

                    if (!overlapsLabel && !coversAnotherMarker && distance < closestDistance) {
                        closestDistance = distance;
                        best = { x: left, y: top };
                    }
                }
            }
        }

        // Em telas excepcionalmente pequenas não há área física para todos os rótulos.
        // Ainda assim, o marcador mantém o nome completo no atributo title.
        best ??= {
            x: Math.max(
                MAP_PADDING,
                Math.min(size.width - point.labelWidth - MAP_PADDING, point.x + 12),
            ),
            y: Math.max(
                MAP_PADDING,
                Math.min(size.height - LABEL_HEIGHT - MAP_PADDING, point.y - LABEL_HEIGHT - 8),
            ),
        };

        const label = {
            ...point,
            labelX: best.x,
            labelY: best.y,
            width: point.labelWidth,
            height: LABEL_HEIGHT,
        };
        placed.push(label);
    }

    return placed;
}

export function RegionsMap2D({ regions }: RegionsMap2DProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState<MapSize>({ width: 0, height: 0 });

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const observer = new ResizeObserver(([entry]) => {
            if (!entry) return;
            setSize({
                width: entry.contentRect.width,
                height: entry.contentRect.height,
            });
        });

        observer.observe(map);
        return () => observer.disconnect();
    }, []);

    const points = useMemo(() => placeLabels(regions, size), [regions, size]);
    const values = points
        .map((point) => point.region.gco2ePerKwh)
        .filter((value): value is number => value != null && Number.isFinite(value));
    const min = values.length ? Math.min(...values) : null;
    const max = values.length ? Math.max(...values) : null;
    const withoutCoordinates = regions.length - points.length;

    return (
        <div className="space-y-3">
            <div
                ref={mapRef}
                className="relative aspect-[2/1] w-full overflow-hidden rounded-lg border border-white/10 bg-[#0b1d2e]"
                role="group"
                aria-label="Mapa-múndi com as regiões monitoradas"
            >
                <img
                    src="/textures/earth.png"
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-fill"
                />

                {size.width > 0 && size.height > 0 && (
                    <>
                        <svg
                            className="pointer-events-none absolute inset-0 h-full w-full"
                            viewBox={`0 0 ${size.width} ${size.height}`}
                            preserveAspectRatio="none"
                            aria-hidden="true"
                        >
                            {points.map((point) => (
                                <line
                                    key={`line-${point.region.code}`}
                                    x1={point.x}
                                    y1={point.y}
                                    x2={point.labelX + point.labelWidth / 2}
                                    y2={point.labelY + LABEL_HEIGHT / 2}
                                    stroke={point.color}
                                    strokeOpacity="0.65"
                                    strokeWidth="1"
                                />
                            ))}
                        </svg>

                        {points.map((point) => (
                            <div key={point.region.code}>
                                <span
                                    className="absolute z-10 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_12px_currentColor]"
                                    style={{
                                        left: `${(point.x / size.width) * 100}%`,
                                        top: `${(point.y / size.height) * 100}%`,
                                        backgroundColor: point.color,
                                        color: point.color,
                                    }}
                                    role="img"
                                    aria-label={`${point.name}: ${formatIntensity(point.region.gco2ePerKwh)}`}
                                    title={`${point.name} · ${formatIntensity(point.region.gco2ePerKwh)}`}
                                />
                                <span
                                    className="absolute z-10 flex h-[22px] items-center rounded-md border border-white/15 bg-[#081225]/90 px-2 text-[11px] font-medium leading-none text-white shadow-lg backdrop-blur-sm"
                                    style={{
                                        left: `${(point.labelX / size.width) * 100}%`,
                                        top: `${(point.labelY / size.height) * 100}%`,
                                        width: point.labelWidth,
                                    }}
                                    title={`${point.name} · ${formatIntensity(point.region.gco2ePerKwh)}`}
                                >
                                    <span className="truncate">{point.name}</span>
                                </span>
                            </div>
                        ))}
                    </>
                )}

                {points.length === 0 && (
                    <p className="absolute inset-0 grid place-items-center bg-[#081225]/35 px-4 text-center text-sm text-white/75">
                        Nenhuma região possui coordenadas válidas para exibição.
                    </p>
                )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <div className="flex min-w-0 items-center gap-2">
                    <span>Menor intensidade</span>
                    <span
                        aria-hidden="true"
                        className="h-2 w-24 rounded-full"
                        style={{
                            background:
                                'linear-gradient(90deg, hsl(140 78% 52%), hsl(70 78% 52%), hsl(0 78% 52%))',
                        }}
                    />
                    <span>Maior intensidade</span>
                </div>
                {min != null && max != null && (
                    <span className="tabular-nums">
                        {formatIntensity(min)} – {formatIntensity(max)}
                    </span>
                )}
                {points.some((point) => point.region.gco2ePerKwh == null) && (
                    <span className="inline-flex items-center gap-1.5">
                        <span aria-hidden="true" className="size-2 rounded-full bg-slate-400" />
                        Sem fator de carbono
                    </span>
                )}
                {withoutCoordinates > 0 && (
                    <span>{withoutCoordinates} região(ões) sem coordenadas</span>
                )}
            </div>
        </div>
    );
}
