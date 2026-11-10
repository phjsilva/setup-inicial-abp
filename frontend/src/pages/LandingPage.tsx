import { useRef, useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import type { GlobeViewHandle } from '../components/globe/GlobeView';
import { ExploreSection } from '../components/landing/ExploreSection';
import { fetchRegionsLast24Hours } from '@/api/regions';
import { fetchServices } from '@/api/services';
import { useAuth } from '@/contexts/auth';
import { useApiQuery } from '@/hooks/useApiQuery';
import { GlobeView } from '../components/globe/GlobeView';
import { GlobeMap2D } from '../components/globe/GlobeView2d';
import { StarsBackground } from '../components/globe/StarsBackground';

const RESET_THRESHOLD = 0.02;
const primaryLink =
    'mt-8 inline-flex items-center rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition-colors hover:bg-cyan-400';

export function LandingPage() {
    const { session } = useAuth();
    const globeRef = useRef<GlobeViewHandle>(null);
    const exploreContainerRef = useRef<HTMLDivElement>(null);
    const globeTargetRef = useRef<HTMLDivElement>(null);
    const globeLayerRef = useRef<HTMLDivElement>(null);
    const prevProgressRef = useRef(0);
    const globeState = useRef({ progress: 0, target: { x: 0, y: 0 }, lon: -90 });
    const force2DRef = useRef(false);

    const [selectedCode, setSelectedCode] = useState<string | null>(null);
    const [autoRotate, setAutoRotate] = useState(true);
    const [force2D, setForce2D] = useState(false);

    useEffect(() => {
        force2DRef.current = force2D;
    }, [force2D]);

    useEffect(() => {
        const updateGlobe = () => {
            const section = exploreContainerRef.current;
            const target = globeTargetRef.current;
            const layer = globeLayerRef.current;

            if (!section || !target || !layer) return;

            const sectionRect = section.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            const layerRect = layer.getBoundingClientRect();

            const progress = Math.max(
                0,
                Math.min(1, (window.innerHeight - sectionRect.top) / (window.innerHeight * 0.7)),
            );

            const previous = prevProgressRef.current;

            globeState.current.progress = progress;

            if (force2DRef.current && progress < previous) {
                setForce2D(false);
                setSelectedCode(null);
            }

            if (previous > RESET_THRESHOLD && progress <= RESET_THRESHOLD) {
                setSelectedCode(null);
                globeRef.current?.resetView();
            }

            prevProgressRef.current = progress;

            globeState.current.target = {
                x: targetRect.left + targetRect.width / 2 - layerRect.left,
                y: targetRect.top + targetRect.height / 2 - layerRect.top,
            };
        };

        updateGlobe();

        window.addEventListener('scroll', updateGlobe, { passive: true });
        window.addEventListener('resize', updateGlobe);

        return () => {
            window.removeEventListener('scroll', updateGlobe);
            window.removeEventListener('resize', updateGlobe);
        };
    }, [session]);

    const { data: services, error } = useApiQuery(session ? fetchServices : null);
    const {
        data: regions,
        error: regionsError,
        isLoading: regionsLoading,
    } = useApiQuery(session ? fetchRegionsLast24Hours : null);

    const markers = useMemo(
        () =>
            (services ?? []).flatMap((service) => {
                const location = service.location;

                if (location?.latitude == null || location.longitude == null) {
                    return [];
                }

                return [
                    {
                        id: service.id,
                        name: service.name,
                        latitude: location.latitude,
                        longitude: location.longitude,
                        status: service.status,
                    },
                ];
            }),
        [services],
    );

    const selectedRegion = useMemo(
        () => regions?.find((region) => region.code === selectedCode) ?? null,
        [regions, selectedCode],
    );

    const rotateLeft = () => {
        globeRef.current?.rotateLeft();
    };

    const rotateRight = () => {
        globeRef.current?.rotateRight();
    };

    const backToRegions = () => {
        setSelectedCode(null);
    };

    const zoom = (factor: number) => {
        globeRef.current?.zoom(factor);
    };

    if (error || regionsError) {
        return (
            <main className="p-6 text-foreground">
                Não foi possível carregar os dados dos serviços ou das regiões.
            </main>
        );
    }

    const focusTarget =
        selectedRegion?.latitude != null && selectedRegion.longitude != null
            ? { latitude: selectedRegion.latitude, longitude: selectedRegion.longitude }
            : null;

    return (
        <main className="relative bg-[radial-gradient(ellipse_at_50%_120%,#0c1d45_0%,#090d1b_60%)] pt-0 pb-0 text-foreground">
            <section
                id="sobre"
                className="relative z-10 flex min-h-svh flex-col justify-center px-6 pt-[var(--header-h,4rem)] pb-32 md:px-12"
            >
                <div className="mx-auto w-full max-w-6xl">
                    <h1 className="bg-linear-to-r from-emerald-300 to-cyan-400 bg-clip-text text-6xl font-extrabold text-transparent md:text-8xl">
                        Green<span className="font-light">ER</span>
                    </h1>

                    <p className="mt-6 max-w-2xl text-xl font-semibold leading-snug text-white md:text-3xl">
                        Do consumo computacional ao impacto ambiental
                    </p>

                    <p className="mt-4 max-w-2xl text-base leading-8 text-slate-400 md:text-lg">
                        Monitore aplicações, estime o consumo energético e compreenda as emissões de
                        CO₂e da sua infraestrutura.
                    </p>

                    {session ? (
                        <a
                            href="#explorar"
                            onClick={(event) => {
                                event.preventDefault();
                                exploreContainerRef.current?.scrollIntoView({
                                    behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
                                        .matches
                                        ? 'auto'
                                        : 'smooth',
                                    block: 'start',
                                });
                            }}
                            className={primaryLink}
                        >
                            Explorar regiões
                        </a>
                    ) : (
                        <Link to="/login" className={primaryLink}>
                            Entrar ou criar conta
                        </Link>
                    )}
                </div>
            </section>

            <div
                ref={globeLayerRef}
                className="pointer-events-none fixed inset-x-0 bottom-0 top-[var(--header-h,4rem)] z-0"
            >
                {force2D ? (
                    <div className="relative h-full w-full">
                        <StarsBackground />
                        <div className="relative h-full w-full">
                            <GlobeMap2D
                                ref={globeRef}
                                autoRotate={autoRotate}
                                stateRef={globeState}
                                markers={markers}
                                focusTarget={focusTarget}
                            />
                        </div>
                    </div>
                ) : (
                    <GlobeView
                        ref={globeRef}
                        autoRotate={autoRotate}
                        stateRef={globeState}
                        markers={markers}
                        focusTarget={focusTarget}
                    />
                )}
            </div>

            {session && (
                <div
                    ref={exploreContainerRef}
                    id="explorar"
                    className="scroll-mt-24 grid grid-cols-1 gap-6 px-6 pt-2 pb-0 md:grid-cols-[minmax(0,560px)_minmax(0,1fr)]"
                >
                    <div className="min-w-0">
                        {regionsLoading && (
                            <p className="text-white/60">
                                Carregando totais das últimas 24 horas...
                            </p>
                        )}
                        <ExploreSection
                            rotateLeft={rotateLeft}
                            rotateRight={rotateRight}
                            dataSource="internal"
                            selectedCode={selectedCode}
                            autoRotate={autoRotate}
                            setAutoRotate={setAutoRotate}
                            force2D={force2D}
                            setForce2D={setForce2D}
                            backToRegions={backToRegions}
                            zoom={zoom}
                            regions={regions ?? []}
                            services={services ?? []}
                            onSelectRegion={setSelectedCode}
                        />
                    </div>

                    <div ref={globeTargetRef} className="min-w-0"></div>
                </div>
            )}
        </main>
    );
}
