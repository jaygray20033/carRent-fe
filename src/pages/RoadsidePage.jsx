// src/pages/RoadsidePage.jsx — Day 37 (UC-31). Figma: (no dedicated mockup)
// Active rescue stations. "Tìm trạm gần nhất" uses the browser geolocation and
// re-queries the server (lat/lng) so results come back nearest-first + distanceKm.
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronRight, MapPin, Phone, Clock, Navigation, LocateFixed } from 'lucide-react';
import toast from 'react-hot-toast';
import { roadsideService } from '../services/roadsideService.js';
import Loading from '../components/common/Loading.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

const HOTLINE = '1900 1234';

// A Google Maps embed centred on the given station (or a default HCMC view).
const mapSrc = (station) => {
  const q = station
    ? `${station.latitude},${station.longitude}`
    : encodeURIComponent('Thành phố Hồ Chí Minh');
  return `https://www.google.com/maps?q=${q}&output=embed`;
};

export default function RoadsidePage() {
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [active, setActive] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['roadside-stations', coords],
    queryFn: () =>
      roadsideService.list(coords ? { lat: coords.lat, lng: coords.lng, radius: 100 } : undefined),
  });

  const stations = data?.data?.items ?? [];
  const focused = active || stations[0] || null;

  const findNearest = () => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt không hỗ trợ định vị.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setActive(null);
        setLocating(false);
        toast.success('Đã sắp xếp các trạm theo khoảng cách gần bạn.');
      },
      () => {
        setLocating(false);
        toast.error('Không lấy được vị trí. Vui lòng cho phép truy cập định vị.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-900">
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/95 to-ink-800" />
        <div className="container-app relative z-10 py-12 md:py-16">
          <nav className="mb-4 flex items-center gap-1.5 text-sm text-white/60">
            <Link to="/" className="transition hover:text-white">
              Trang chủ
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-white">Trạm cứu hộ</span>
          </nav>
          <p className="mb-1 text-sm font-semibold text-brand-accent">Hỗ trợ 24/7</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Trạm cứu hộ OtoRent</h1>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            Gặp sự cố trên đường? Tìm trạm cứu hộ gần bạn nhất hoặc gọi hotline khẩn cấp{' '}
            <a href={`tel:${HOTLINE.replace(/\s/g, '')}`} className="font-semibold text-white">
              {HOTLINE}
            </a>
            .
          </p>
        </div>
      </section>

      <div className="container-app py-10 lg:py-14">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-ink-900">
            {coords ? 'Trạm gần bạn nhất' : 'Danh sách trạm cứu hộ'}
          </h2>
          <button
            type="button"
            onClick={findNearest}
            disabled={locating}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-primary-dark disabled:opacity-60"
          >
            <LocateFixed className={`h-4 w-4 ${locating ? 'animate-pulse' : ''}`} />
            {locating ? 'Đang định vị…' : 'Tìm trạm gần nhất'}
          </button>
        </div>

        {isError ? (
          <EmptyState title="Không tải được danh sách trạm" description="Vui lòng thử lại sau." />
        ) : isLoading ? (
          <div className="py-12">
            <Loading />
          </div>
        ) : stations.length === 0 ? (
          <EmptyState
            title="Chưa có trạm cứu hộ"
            description="Hiện chưa có trạm nào được kích hoạt."
          />
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            {/* Station list */}
            <div className="space-y-3 lg:col-span-2">
              {stations.map((s) => {
                const isActive = focused?.id === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActive(s)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      isActive
                        ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary'
                        : 'border-ink-100 bg-white hover:border-brand-primary/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-ink-900">{s.name}</p>
                        {(s.district || s.city) && (
                          <p className="mt-0.5 text-xs text-ink-400">
                            {[s.district, s.city].filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>
                      {Number.isFinite(s.distanceKm) && (
                        <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-brand-accent/20 px-2.5 py-1 text-xs font-semibold text-brand-accent-dark">
                          <Navigation className="h-3 w-3" />
                          {s.distanceKm.toFixed(1)} km
                        </span>
                      )}
                    </div>
                    <div className="mt-3 space-y-1.5 text-sm text-ink-500">
                      <p className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink-300" />
                        {s.address}
                      </p>
                      {s.phone && (
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4 flex-shrink-0 text-ink-300" />
                          <a
                            href={`tel:${s.phone}`}
                            className="text-brand-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {s.phone}
                          </a>
                        </p>
                      )}
                      {s.hours && (
                        <p className="flex items-center gap-2">
                          <Clock className="h-4 w-4 flex-shrink-0 text-ink-300" />
                          {s.hours}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Map */}
            <div className="lg:col-span-3">
              <div className="sticky top-24 overflow-hidden rounded-2xl shadow-card ring-1 ring-ink-100">
                <iframe
                  title="Bản đồ trạm cứu hộ"
                  key={focused?.id ?? 'default'}
                  src={mapSrc(focused)}
                  className="h-[420px] w-full border-0 lg:h-[560px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
