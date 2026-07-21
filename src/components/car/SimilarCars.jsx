// src/components/car/SimilarCars.jsx — Horizontal scroll "Có thể bạn quan tâm"
import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { carService } from '../../services/carService.js';
import CarCard from './CarCard.jsx';

export default function SimilarCars({ currentCarId, brandSlug, categorySlug }) {
  const scrollRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ['similar-cars', currentCarId, brandSlug, categorySlug],
    queryFn: () =>
      carService.list({
        brand: brandSlug,
        category: categorySlug,
        limit: 8,
        sort: 'popular',
      }),
    staleTime: 5 * 60_000,
  });

  const cars = (data?.data ?? []).filter((c) => c.id !== currentCarId).slice(0, 4);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const w = scrollRef.current.offsetWidth;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -w * 0.7 : w * 0.7, behavior: 'smooth' });
  };

  if (!isLoading && cars.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-ink-900">Có thể bạn quan tâm</h2>
        <div className="flex gap-1.5">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full border border-ink-200 flex items-center justify-center hover:bg-ink-50 transition"
          >
            <ChevronLeft className="w-4 h-4 text-ink-500" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full border border-ink-200 flex items-center justify-center hover:bg-ink-50 transition"
          >
            <ChevronRight className="w-4 h-4 text-ink-500" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory scrollbar-thin"
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[280px] snap-start">
                <CarCard loading />
              </div>
            ))
          : cars.map((car) => (
              <div key={car.id} className="flex-shrink-0 w-[280px] snap-start">
                <CarCard car={car} />
              </div>
            ))}
      </div>
    </section>
  );
}
