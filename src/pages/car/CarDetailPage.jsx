import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, Cog, Fuel, MapPin, Star, Calendar } from 'lucide-react';
import { carService } from '../../services/carService.js';
import { formatCurrency } from '../../utils/format.js';
import Loading from '../../components/common/Loading.jsx';

export default function CarDetailPage() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['car', id],
    queryFn: () => carService.detail(id),
  });

  if (isLoading) return <Loading />;
  const car = data?.data?.car;
  if (!car) return <div className="p-8 text-center text-gray-500">Không tìm thấy xe.</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <img
              src={car.thumbnailUrl || 'https://placehold.co/1000x600?text=Car'}
              alt={car.name}
              className="aspect-video w-full object-cover"
            />
          </div>

          <div className="card mt-4 p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{car.name}</h1>
                <p className="text-sm text-gray-500">
                  {car.brand?.name} • {car.category?.name} • {car.modelYear}
                </p>
              </div>
              {Number(car.rating) > 0 && (
                <div className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-amber-700">
                  <Star className="h-4 w-4 fill-current" />
                  {Number(car.rating).toFixed(1)}
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Spec icon={Users} label="Số chỗ" value={`${car.seats} chỗ`} />
              <Spec
                icon={Cog}
                label="Hộp số"
                value={car.transmission === 'AUTO' ? 'Tự động' : 'Số sàn'}
              />
              <Spec icon={Fuel} label="Nhiên liệu" value={car.fuelType} />
              <Spec
                icon={MapPin}
                label="Trạm"
                value={car.station?.city || 'Đang cập nhật'}
              />
            </div>

            {car.description && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900">Mô tả</h3>
                <p className="mt-2 whitespace-pre-line text-sm text-gray-600">
                  {car.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="card sticky top-20 p-6">
            <div className="mb-4 border-b border-gray-100 pb-4">
              <div className="text-3xl font-bold text-primary-600">
                {formatCurrency(car.pricePerDay)}
              </div>
              <div className="text-sm text-gray-500">/ngày</div>
            </div>

            {car.status === 'AVAILABLE' ? (
              <Link to={`/checkout/${car.id}`} className="btn-primary w-full">
                <Calendar className="h-4 w-4" />
                Đặt xe ngay
              </Link>
            ) : (
              <button disabled className="btn-outline w-full">
                Xe đang không sẵn sàng
              </button>
            )}

            <p className="mt-3 text-xs text-gray-500">
              Bạn sẽ chọn thời gian thuê ở bước tiếp theo.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Spec({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-gray-100 p-3">
      <div className="flex items-center gap-2 text-gray-500">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>
      <div className="mt-1 text-sm font-semibold text-gray-900">{value}</div>
    </div>
  );
}
