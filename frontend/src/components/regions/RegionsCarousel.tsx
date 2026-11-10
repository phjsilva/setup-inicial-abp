import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { A11y, Mousewheel, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/a11y';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import type { Region } from '@/types/api';
import { RegionCard } from './RegionCard';

interface RegionsCarouselProps {
    regions: Region[];
}

export function RegionsCarousel({ regions }: RegionsCarouselProps) {
    const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
    const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);
    const [paginationEl, setPaginationEl] = useState<HTMLDivElement | null>(null);

    return (
        <div className="region-slider relative px-0 min-[720px]:px-12">
            <button
                ref={setPrevEl}
                type="button"
                aria-label="Região anterior"
                className="swiper-button-prev !left-0"
            >
                <ChevronLeft aria-hidden="true" className="size-5" />
            </button>

            <Swiper
                modules={[A11y, Mousewheel, Navigation, Pagination]}
                navigation={{ prevEl, nextEl }}
                pagination={{ el: paginationEl, clickable: true }}
                mousewheel={true}
                spaceBetween={16}
                breakpoints={{
                    0: { slidesPerView: 1 },
                    720: { slidesPerView: 2 },
                    1000: { slidesPerView: 3 },
                    1280: { slidesPerView: 4 },
                }}
                className="w-full"
            >
                {regions.map((region) => (
                    <SwiperSlide key={region.code}>
                        <RegionCard region={region} />
                    </SwiperSlide>
                ))}
            </Swiper>

            <button
                ref={setNextEl}
                type="button"
                aria-label="Próxima região"
                className="swiper-button-next !right-0"
            >
                <ChevronRight aria-hidden="true" className="size-5" />
            </button>

            <div ref={setPaginationEl} className="swiper-pagination" />
        </div>
    );
}
