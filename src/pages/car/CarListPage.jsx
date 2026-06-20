import { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ChevronRight, SlidersHorizontal } from 'lucide-react';
import { carService } from '../../services/carService.js';
import CarCard from '../../components/car/CarCard.jsx';
import CarFilterSidebar from '../../components/car/CarFilterSidebar.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

const SORT_OPTIONS = [
  { value: 'popular', label: 'Phổ biến' },
  { value: 'price_asc', label: 'Giá thấp đến cao' },
  { value: 'price_desc', label: 'Giá cao đến thấp' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'rating', label: 'Đánh giá' },
];

const PER_PAGE = 12;

// Keys we sync with the URL (?key=value)
const FILTER_KEYS = [
  'q',
  'brand',
  'category',
  'type',
  'seats',
  'transmission',
  'fuel',
  'price_min',
  'price_max',
  'station_id',
  'sort',
  'page',
];

export default function CarListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive the current filter object straight from the URL (single source of truth)
  const filters = useMemo(() => {
    const obj = {};
    FILTER_KEYS.forEach((k) => {
      const v = searchParams.get(k);
      if (v !== null && v !== '') obj[k] = v;
    });
    return obj;
  }, [searchParams]);

  const page = Number(filters.page) || 1;
  const sort = filters.sort || 'popular';

  // Build the API query (map UI filters → backend params)
  const apiParams = useMemo(() => {
    const p = { page, limit: PER_PAGE, sort };
    if (filters.q) p.q = filters.q;
    if (filters.category) p.category = filters.category;
    if (filters.brand) p.brand = filters.brand; // CSV of slugs (single supported by BE; first wins)
    if (filters.seats) p.seats = filters.seats;
    if (filters.transmission) p.transmission = filters.transmission;
    if (filters.fuel) p.fuel = filters.fuel;
    if (filters.price_min) p.price_min = filters.price_min;
    if (filters.price_max) p.price_max = filters.price_max;
    if (filters.station_id) p.station_id = filters.station_id;
    if (filters.type) p.featuredTag = undefined; // "nhu cầu" is UI-only for now
    // If multiple brands selected, send only the first slug (BE filters by single slug)
    if (p.brand && p.brand.includes(',')) p.brand = p.brand.split(',')[0];
    return p;
  }, [filters, page, sort]);

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ['cars', apiParams],
    queryFn: () => carService.list(apiParams),
    placeholderData: keepPreviousData,
  });

  const cars = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  // ── URL sync helpers ──
  const updateParams = (patch, { resetPage = true } = {}) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === '' || v === null || v === undefined) next.delete(k);
      else next.set(k, v);
    });
    if (resetPage) next.delete('page');
    setSearchParams(next);
  };

  const handleFilterChange = (patch) => updateParams(patch);
  const handleApply = () => {
    // filters are already applied live; scroll back to top of results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleReset = () => setSearchParams(new URLSearchParams());
  const handleSort = (value) => updateParams({ sort: value });
  const handlePage = (p) => {
    updateParams({ page: String(p) }, { resetPage: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      {/* ═══ SubHero — black banner ═══ */}
      <section className="relative overflow-hidden bg-ink-900">
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/95 to-ink-800" />
        <div className="container-app relative z-10 py-12 md:py-16">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-1.5 text-sm text-white/60">
            <Link to="/" className="transition hover:text-white">
              Trang chủ
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-white">Thuê xe</span>
          </nav>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            <span className="text-brand-accent">Thuê xe Ôtô</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            OtoRent — Danh sách cho thuê. Lựa chọn xe phù hợp với nhu cầu của bạn.
          </p>
        </div>
      </section>

      {/* ═══ Body ═══ */}
      <div className="container-app py-8">
        {/* Top control bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-500">
            Tìm thấy <span className="font-semibold text-ink-900">{total}</span> xe
          </p>
          <div className="flex items-center gap-2">
            <label className="text-sm text-ink-500">Sắp xếp theo:</label>
            <select
              value={sort}
              onChange={(e) => handleSort(e.target.value)}
              className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-900 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2-column layout: results (left) + filter (right, per Figma) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          {/* ── Results ── */}
          <main>
            {isError ? (
              <EmptyState
                title="Không tải được danh sách xe"
                description="Vui lòng thử lại sau."
              />
            ) : isLoading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CarCard key={i} loading />
                ))}
              </div>
            ) : cars.length === 0 ? (
              <EmptyState
                title="Không tìm thấy xe phù hợp"
                description="Hãy thử thay đổi bộ lọc hoặc xoá bớt điều kiện tìm kiếm."
                action={
                  <button
                    onClick={handleReset}
                    className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-primary-dark"
                  >
                    Xoá bộ lọc
                  </button>
                }
              />
            ) : (
              <div
                className={`grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 ${
                  isFetching ? 'opacity-60 transition-opacity' : ''
                }`}
              >
                {cars.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePage}
                />
              </div>
            )}
          </main>

          {/* ── Filter sidebar (right) ── */}
          <div className="order-first lg:order-last">
            <div className="mb-3 flex items-center gap-2 lg:hidden">
              <SlidersHorizontal className="h-4 w-4 text-ink-500" />
              <span className="text-sm font-semibold text-ink-900">Bộ lọc</span>
            </div>
            <div className="lg:sticky lg:top-24">
              <CarFilterSidebar
                value={filters}
                onChange={handleFilterChange}
                onApply={handleApply}
                onReset={handleReset}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
