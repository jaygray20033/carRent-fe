import { Link } from 'react-router-dom';
import { Users, Cog, Fuel, MapPin, Star } from 'lucide-react';
import { formatCurrency } from '../../utils/format.js';

export default function CarCard({ car }) {
  return (
    <Link
      to={`/cars/${car.id}`}
      className="card group overflow-hidden transition hover:shadow-md"
    >
      <div className="aspect-[16/10] overflow-hidden bg-gray-100">
        <img
          src={car.thumbnailUrl || 'https://placehold.co/600x400?text=Car'}
          alt={car.name}
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-gray-900">{car.name}</h3>
            <p className="text-xs text-gray-500">
              {car.brand?.name} • {car.category?.name}
            </p>
          </div>
          {Number(car.rating) > 0 && (
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <Star className="h-3.5 w-3.5 fill-current" />
              {Number(car.rating).toFixed(1)}
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {car.seats} chỗ
          </span>
          <span className="inline-flex items-center gap-1">
            <Cog className="h-3.5 w-3.5" /> {car.transmission === 'AUTO' ? 'Số tự động' : 'Số sàn'}
          </span>
          <span className="inline-flex items-center gap-1">
            <Fuel className="h-3.5 w-3.5" /> {car.fuelType}
          </span>
        </div>

        {car.station?.city && (
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3.5 w-3.5" /> {car.station.city}
          </p>
        )}

        <div className="mt-3 flex items-end justify-between border-t border-gray-100 pt-3">
          <div>
            <div className="text-lg font-bold text-primary-600">
              {formatCurrency(car.pricePerDay)}
            </div>
            <div className="text-xs text-gray-500">/ngày</div>
          </div>
          <span className="rounded-md bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700">
            Đặt ngay
          </span>
        </div>
      </div>
    </Link>
  );
}
