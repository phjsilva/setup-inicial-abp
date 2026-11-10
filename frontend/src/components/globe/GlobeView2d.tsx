import { forwardRef, useEffect, useImperativeHandle, useRef, type RefObject } from 'react';
import type { GlobeMarker, GlobeViewHandle, GlobeState } from './GlobeView';
import { statusStyle } from '@/utils/statusStyle';

interface GlobeMap2DProps {
    autoRotate?: boolean;
    stateRef: RefObject<GlobeState>;
    focusTarget: {
        latitude: number;
        longitude: number;
    } | null;
    markers: GlobeMarker[];
}

const MAP_TEXTURE = '/textures/earth.png';

const TILE_OFFSETS = [-1, 0, 1];

const FOCUS_ZOOM = 3;
const MAX_ZOOM = 6;
const ROTATION_STEP_DEG = 30;
const AUTO_ROTATE_DEG_PER_SECOND = 11.5;

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function lerp(from: number, to: number, t: number): number {
    return from + (to - from) * t;
}

function wrapLongitude(longitude: number): number {
    return ((((longitude + 180) % 360) + 360) % 360) - 180;
}

export const GlobeMap2D = forwardRef<GlobeViewHandle, GlobeMap2DProps>(function GlobeMap2D(
    { autoRotate = true, stateRef, focusTarget, markers },
    ref,
) {
    const containerRef = useRef<HTMLDivElement>(null);
    const frameRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<HTMLDivElement>(null);

    const autoRotateRef = useRef(autoRotate);
    const focusTargetRef = useRef(focusTarget);

    const commandsRef = useRef({
        rotation: 0,
        zoomFactor: 1,
        reset: false,
        resetPosition: false,
    });

    // lon/lat: ponto do mapa no centro da moldura. zoom: valor atual (animado).
    // zoomLevel: ajuste manual do usuário (botões + e −).
    const viewRef = useRef({ lon: 0, lat: 0, zoom: 1, zoomLevel: 1 });

    useImperativeHandle(
        ref,
        () => ({
            rotateLeft: () => {
                commandsRef.current.rotation -= ROTATION_STEP_DEG;
            },
            rotateRight: () => {
                commandsRef.current.rotation += ROTATION_STEP_DEG;
            },
            zoom: (factor: number) => {
                if (factor > 0) {
                    commandsRef.current.zoomFactor *= factor;
                }
            },
            resetView: () => {
                commandsRef.current.reset = true;
            },
            resetPosition: () => {
                commandsRef.current.resetPosition = true;
            },
        }),
        [],
    );

    useEffect(() => {
        autoRotateRef.current = autoRotate;
    }, [autoRotate]);

    useEffect(() => {
        focusTargetRef.current = focusTarget;
    }, [focusTarget]);

    useEffect(() => {
        const container = containerRef.current;
        const frame = frameRef.current;
        const map = mapRef.current;
        if (!container || !frame || !map) return;

        const size = { w: container.clientWidth, h: container.clientHeight };

        const resizeObserver = new ResizeObserver(() => {
            size.w = container.clientWidth;
            size.h = container.clientHeight;
        });

        resizeObserver.observe(container);

        let animationId = 0;
        let previousTime = 0;

        const animate = (time: number) => {
            animationId = requestAnimationFrame(animate);

            const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0;
            previousTime = time;

            const commands = commandsRef.current;
            const view = viewRef.current;
            const focus = focusTargetRef.current;

            if (commands.reset) {
                view.zoomLevel = 1;
                commands.rotation = 0;
                commands.zoomFactor = 1;
                commands.reset = false;
            }

            if (commands.resetPosition) {
                view.lon = 0;
                view.lat = 0;
                view.zoom = 1;
                view.zoomLevel = 1;
                commands.rotation = 0;
                commands.zoomFactor = 1;
                commands.resetPosition = false;
            }

            // Zoom: o foco aproxima (como a câmera em 3.0 no globo) e o usuário ajusta por cima.
            const baseZoom = focus ? FOCUS_ZOOM : 1;

            if (commands.zoomFactor !== 1) {
                view.zoomLevel *= commands.zoomFactor;
                commands.zoomFactor = 1;
            }

            view.zoomLevel = clamp(view.zoomLevel, 1 / baseZoom, MAX_ZOOM / baseZoom);
            view.zoom = lerp(view.zoom, baseZoom * view.zoomLevel, Math.min(delta * 3, 1));

            // Centro do mapa: vai até a região em foco ou volta ao equador.
            if (focus) {
                const t = Math.min(delta * 2.5, 1);
                const longitudeDelta = wrapLongitude(focus.longitude - view.lon);

                view.lon = wrapLongitude(view.lon + longitudeDelta * t);
                view.lat = lerp(view.lat, focus.latitude, t);
                commands.rotation = 0;
            } else {
                const step = commands.rotation * Math.min(delta * 6, 1);

                view.lon = wrapLongitude(view.lon - step);
                commands.rotation -= step;

                if (Math.abs(commands.rotation) < 0.01) {
                    commands.rotation = 0;
                }

                if (autoRotateRef.current) {
                    view.lon = wrapLongitude(view.lon - delta * AUTO_ROTATE_DEG_PER_SECOND);
                }

                view.lat = lerp(view.lat, 0, Math.min(delta * 2, 1));
            }

            // Não deixa a moldura mostrar além dos polos.
            const maxLatitude = 90 - 90 / view.zoom;
            view.lat = clamp(view.lat, -maxLatitude, maxLatitude);

            const { w: containerWidth, h: containerHeight } = size;
            if (!containerWidth || !containerHeight) return;

            const { progress, target } = stateRef.current;
            const p = clamp(progress, 0, 1);
            const smooth = p * p * (3 - 2 * p);

            const fitWidth = Math.min(containerWidth, containerHeight * 2) * 0.9;
            const targetX = target.x > 0 ? target.x : containerWidth / 2;
            const targetY = target.y > 0 ? target.y : containerHeight / 2;
            const availableWidth = 2 * Math.min(targetX, containerWidth - targetX) * 0.95;

            const width = lerp(fitWidth, Math.min(fitWidth, availableWidth), smooth);
            const height = width / 2;

            const centerX = lerp(containerWidth / 2, targetX, smooth);
            const centerY = clamp(
                lerp(containerHeight / 2, targetY, smooth),
                height / 2,
                Math.max(height / 2, containerHeight - height / 2),
            );

            frame.style.width = `${width}px`;
            frame.style.height = `${height}px`;
            frame.style.left = `${centerX - width / 2}px`;
            frame.style.top = `${centerY - height / 2}px`;

            // O mapa interno tem 3 telhas de largura; a do meio fica centralizada na moldura.
            map.style.width = `${width * 3}px`;
            map.style.height = `${height}px`;
            map.style.left = `${-width}px`;

            const offsetX = (view.lon / 360) * width;
            const offsetY = -(view.lat / 180) * height;

            map.style.transform = `translate(${-offsetX * view.zoom}px, ${-offsetY * view.zoom}px) scale(${view.zoom})`;
            map.style.setProperty('--inverse-zoom', String(1 / view.zoom));
        };

        animate(0);

        return () => {
            cancelAnimationFrame(animationId);
            resizeObserver.disconnect();
        };
    }, [stateRef]);

    return (
        <div
            ref={containerRef}
            className="relative h-full w-full"
            aria-label="Mapa 2D do GreenER"
            role="img"
        >
            <div
                ref={frameRef}
                className="absolute overflow-hidden rounded-xl border border-white/10 bg-[#0b1d2e]"
            >
                <div
                    ref={mapRef}
                    className="absolute top-0 will-change-transform"
                    style={{
                        backgroundImage: `url(${MAP_TEXTURE})`,
                        backgroundSize: `${100 / 3}% 100%`,
                        backgroundRepeat: 'repeat-x',
                    }}
                >
                    {TILE_OFFSETS.map((tile) =>
                        markers.map((marker) => (
                            <span
                                key={`${tile}-${marker.id}`}
                                aria-hidden="true"
                                className="absolute block h-2.5 w-2.5 rounded-full border border-white/80"
                                style={{
                                    left: `${(((marker.longitude + 180) / 360 + tile + 1) / 3) * 100}%`,
                                    top: `${((90 - marker.latitude) / 180) * 100}%`,
                                    backgroundColor: statusStyle(marker.status).color,
                                    transform:
                                        'translate(-50%, -50%) scale(var(--inverse-zoom, 1))',
                                }}
                            />
                        )),
                    )}
                </div>
            </div>
        </div>
    );
});
