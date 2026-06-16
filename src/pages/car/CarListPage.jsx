import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { carService } from '../../services/carService.js';
import CarCard from '../../components/car/CarCard.jsx';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

export default function CarListPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: '',
    transmission: '',
    fuelType: '',
    sort: 'newest',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['cars', filters],
    queryFn: () => {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '' && v !== null && v !== undefined)
      );
      return carService.list(params);
    },
  });

  const update = (patch) => setFilters((s) => ({ ...s, ...patch, page: 1 }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Danh sách xe</h1>
      <p className="mt-1 text-sm text-gray-500">
        {data?.meta?.total ?? 0} xe sẵn sàng cho thuê
      </p>

      {/* Filters */}
      <div className="card mt-6 p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                className="input pl-9"
                placeholder="Tìm theo tên xe, biển số..."
                value={filters.search}
                onChange={(e) => update({ search: e.target.value })}
              />
            </div>
          </div>
          <select
            className="input"
            value={filters.transmission}
            onChange={(e) => update({ transmission: e.target.value })}
          >
            <option value="">Hộp số (tất cả)</option>
            <option value="AUTO">Số tự động</option>
            <option value="MANUAL">Số sàn</option>
          </select>
          <select
            className="input"
            value={filters.sort}
            onChange={(e) => update({ sort: e.target.value })}
          >
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
            <option value="rating">Đánh giá cao</option>
          </select>
        </div>
      </div>

      {/* Result */}
      <div className="mt-6">
        {isLoading ? (
          <Loading />
        ) : !data?.data?.length ? (
          <EmptyState
            title="Không tìm thấy xe"
            description="Hãy thử thay đổi điều kiện lọc."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination (simple) */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            className="btn-outline"
            disabled={filters.page <= 1}
            onClick={() => setFilters((s) => ({ ...s, page: s.page - 1 }))}
          >
            ← Trước
          </button>
          <span className="text-sm text-gray-600">
            Trang {filters.page} / {data.meta.totalPages}
          </span>
          <button
            className="btn-outline"
            disabled={filters.page >= data.meta.totalPages}
            onClick={() => setFilters((s) => ({ ...s, page: s.page + 1 }))}
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
}
