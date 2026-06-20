import { Link } from 'react-router-dom';
import { Star, Fuel, Cog, Calendar } from 'lucide-react';
import { formatCurrency } from '../../utils/format.js';

/**
 * CarCard — Figma-accurate card component
 * Reusable across HomePage FeaturedCars, PLP, Similar Cars
 */
export default function CarCard({ car, loading = false }) {
  if (loading) return <CarCardSkeleton />;

  const fuelLabel =
    car.fuelType === 'DIESEL' ? 'Dầu' : car.fuelType === 'ELECTRIC' ? 'Điện' : 'Xăng';
  const transLabel = car.transmission === 'AUTO' ? 'Số tự động' : 'Số sàn';

  return (
    <Link
      to={`/cars/${car.id}`}
      className="card group overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 block"
    >
      {/* Thumbnail 16:10 ratio */}
      <div className="relative aspect-[16/10] overflow-hidden bg-ink-50">
        <img
          src={car.thumbnailUrl || 'https://placehold.co/600x375?text=Car'}
          alt={car.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
        {/* Rating badge */}
        {Number(car.rating) > 0 && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
            <Star className="w-3.5 h-3.5 fill-brand-accent text-brand-accent" />
            <span className="text-xs font-semibold text-ink-900">
              {Number(car.rating).toFixed(1)}
            </span>
            <span className="text-[10px] text-ink-400">({car.reviewCount || 0})</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {/* Model name + year */}
        <h3 className="font-bold text-ink-900 text-sm leading-tight mb-2 truncate">{car.name}</h3>

        {/* Specs: năm SX + nhiên liệu / transmission */}
        <div className="flex items-center gap-3 text-xs text-ink-500 mb-3">
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {car.modelYear}
          </span>
          <span className="inline-flex items-center gap-1">
            <Fuel className="w-3.5 h-3.5" />
            {fuelLabel}
          </span>
          <span className="inline-flex items-center gap-1">
            <Cog className="w-3.5 h-3.5" />
            {transLabel}
          </span>
        </div>

        {/* Prices */}
        <div className="space-y-1 mb-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-ink-500">Thuê theo ngày</span>
            <span className="text-base font-bold text-brand-primary">
              {formatCurrency(car.pricePerDay)} <span className="text-xs font-normal">VNĐ</span>
            </span>
          </div>
          {car.pricePerMonth && (
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-ink-500">Thuê theo tháng</span>
              <span className="text-sm font-semibold text-ink-700">
                {formatCurrency(car.pricePerMonth)} <span className="text-xs font-normal">VNĐ</span>
              </span>
            </div>
          )}
          {car.depositAmount > 0 && (
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-ink-500">Tiền đặt cọc</span>
              <span className="text-sm text-ink-600">
                {formatCurrency(car.depositAmount)} <span className="text-xs">VNĐ</span>
              </span>
            </div>
          )}
        </div>

        {/* CTA */}
        <button className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
          Yêu cầu đặt xe
        </button>
      </div>
    </Link>
  );
}

function CarCardSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="aspect-[16/10] bg-ink-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-ink-100 rounded w-3/4" />
        <div className="flex gap-2">
          <div className="h-3 bg-ink-100 rounded w-12" />
          <div className="h-3 bg-ink-100 rounded w-12" />
          <div className="h-3 bg-ink-100 rounded w-16" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-ink-100 rounded w-full" />
          <div className="h-3 bg-ink-100 rounded w-2/3" />
        </div>
        <div className="h-9 bg-ink-100 rounded w-full" />
      </div>
    </div>
  );
}
