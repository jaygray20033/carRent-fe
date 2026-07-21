// src/pages/car/CarDetailPage.jsx — Full PDP (Product Detail Page) per Figma
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MapPin,
  ChevronRight,
  Fuel,
  Cog,
  Users,
  Calendar,
  Gauge,
  Wifi,
  Navigation,
  Camera,
  Usb,
  Bluetooth,
  MonitorSmartphone,
  Umbrella,
  ParkingSquare,
  Sparkles,
  Snowflake,
  CircleAlert,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ShieldPlus,
} from 'lucide-react';

import { carService } from '../../services/carService.js';
import { formatCurrency } from '../../utils/format.js';
import Loading from '../../components/common/Loading.jsx';
import ImageGallery from '../../components/car/ImageGallery.jsx';
import BookingWidget from '../../components/booking/BookingWidget.jsx';
import SimilarCars from '../../components/car/SimilarCars.jsx';
import Rating from '../../components/ui/Rating.jsx';

// ─── Amenities / Features Map ────────────────────────────────────────
const AMENITIES = [
  { key: 'wifi', icon: Wifi, label: 'WiFi' },
  { key: 'gps', icon: Navigation, label: 'GPS' },
  { key: 'camera', icon: Camera, label: 'Camera' },
  { key: 'usb', icon: Usb, label: 'Cổng USB' },
  { key: 'bluetooth', icon: Bluetooth, label: 'Bluetooth' },
  { key: 'screen', icon: MonitorSmartphone, label: 'Màn hình' },
  { key: 'sunroof', icon: Umbrella, label: 'Cửa sổ trời' },
  { key: 'parking_sensor', icon: ParkingSquare, label: 'Cảm biến lùi' },
  { key: 'leather', icon: Sparkles, label: 'Ghế da' },
  { key: 'ac', icon: Snowflake, label: 'Điều hoà' },
];

// ─── Insurance Comparison Data ───────────────────────────────────────
const INSURANCE_ROWS = [
  { label: 'Phí bảo hiểm cộng thêm', basic: '0', premium: '200.000₫/ngày' },
  { label: 'Tổn thất vật chất', basic: '100.000.000₫', premium: '300.000₫' },
  { label: 'Mất cắp', basic: '100.000.000₫', premium: '300.000₫' },
  { label: 'Tai nạn', basic: 'Không bao gồm', premium: 'Có bao gồm' },
  { label: 'Thủy kích', basic: 'Không bao gồm', premium: 'Có bao gồm' },
  { label: 'Trầy xước ngoại thất', basic: 'Tự chi trả', premium: 'Miễn phí sửa chữa' },
  { label: 'Hư hỏng gầm/lốp', basic: 'Tự chi trả', premium: 'Hỗ trợ gốt điểm' },
];

// ─── Rental Rules Data ──────────────────────────────────────────────
const RENTAL_RULES = [
  {
    title: 'Giấy tờ yêu cầu',
    content:
      'Cung cấp giấy phép lái xe còn hạn sử dụng tối thiểu 6 tháng. Cung cấp thẻ căn cước công dân/hộ chiếu. Cung cấp một biên nhận bảo lãnh đặng ký tài liệu hoặc mô tả liên quan ghi rõ tương đương giá trị của các dòng xe đối với các dòng xe đời mới.',
  },
  {
    title: 'Giấy tờ yêu cầu đối với người nước ngoài thuê xe',
    content:
      'Bản sao giấy phép lái xe quốc gia của nước mà bạn có hộ chiếu, giấy phép lái xe quốc tế còn hiệu lực. Bản sao hộ chiếu đối với các loại xe có giá trị thành phần tương đương.',
  },
  {
    title: 'Giấy tờ thuê xe dành cho các tổ chức / doanh nghiệp',
    content:
      'Cung cấp giấy tờ định danh và xác minh danh tính của người đại diện pháp luật hoặc giám đốc công ty. Cung cấp bao sao điều lệ thoả thuận lập công ty.',
  },
  {
    title: 'Các loại hình bảo hiểm cho từng dòng xe',
    content:
      'Công ty OtoRent cung cấp hai loại hình bảo hiểm chính bao gồm Bảo hiểm cơ bản và Bảo hiểm toàn diện nhằm đáp ứng linh hoạt các nhu cầu khác nhau của khách hàng.',
  },
];

export default function CarDetailPage() {
  const { id } = useParams();
  const [expandedRule, setExpandedRule] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['car', id],
    queryFn: () => carService.detail(id),
  });

  // Fetch reviews
  const { data: reviewsData } = useQuery({
    queryKey: ['car-reviews', id],
    queryFn: () => carService.reviews(id),
    enabled: !!id,
    staleTime: 60_000,
  });
  const reviews = reviewsData?.data ?? [];

  if (isLoading) return <Loading />;
  const car = data?.data?.car;
  if (!car)
    return (
      <div className="p-8 text-center text-ink-500">Không tìm thấy xe.</div>
    );

  const fuelLabel =
    car.fuelType === 'DIESEL'
      ? 'Dầu diesel'
      : car.fuelType === 'ELECTRIC'
        ? 'Điện'
        : 'Xăng';
  const transLabel = car.transmission === 'AUTO' ? 'Tự động' : 'Số sàn';
  const images = car.images ?? [];

  return (
    <div>
      {/* ═══ SubHero Banner ═══ */}
      <section className="relative overflow-hidden bg-ink-900">
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/95 to-ink-800" />
        <div className="container-app relative z-10 py-8 md:py-10">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            <span className="text-brand-accent">Thuê xe Ôtô</span>
          </h1>
          <p className="mt-1 text-sm text-white/60">
            OtoRent — Đăng ký yêu cầu đặt xe
          </p>
        </div>
      </section>

      {/* ═══ Breadcrumb ═══ */}
      <div className="container-app py-3">
        <nav className="flex items-center gap-1.5 text-sm text-ink-400">
          <Link to="/" className="hover:text-brand-primary transition">
            Trang chủ
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/cars" className="hover:text-brand-primary transition">
            Thuê xe
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-ink-700 font-medium truncate max-w-[200px]">
            {car.name}
          </span>
        </nav>
      </div>

      {/* ═══ Main Content (Figma: BookingWidget LEFT + Details RIGHT) ═══ */}
      <div className="container-app pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 xl:gap-8">
          {/* ── LEFT: Sticky Booking Widget ── */}
          <aside className="order-2 lg:order-1">
            <BookingWidget car={car} />

            {/* Mobile: show as bottom bar hint */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-ink-100 shadow-lg px-4 py-3 flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-brand-primary">
                  {formatCurrency(car.pricePerDay)}
                </span>
                <span className="text-xs text-ink-400">/ngày</span>
              </div>
              <a
                href="#booking-widget"
                className="btn btn-primary btn-md"
              >
                Đặt ngay
              </a>
            </div>
          </aside>

          {/* ── RIGHT: Car Details ── */}
          <main className="order-1 lg:order-2 space-y-6">
            {/* 1. Image Gallery */}
            <ImageGallery images={images} carName={car.name} />

            {/* 2. Title + Rating + Location */}
            <div className="card p-5">
              <h2 className="text-2xl font-bold text-ink-900">{car.name}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {Number(car.rating) > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Rating value={Number(car.rating)} size="sm" />
                    <span className="text-sm font-semibold text-ink-700">
                      {Number(car.rating).toFixed(1)}
                    </span>
                    <span className="text-xs text-ink-400">
                      ({car.reviewCount || 0} đánh giá)
                    </span>
                  </div>
                )}
                <span className="text-ink-200">•</span>
                <div className="flex items-center gap-1 text-sm text-ink-500">
                  <MapPin className="w-4 h-4" />
                  {car.station?.name || car.station?.city || 'Đang cập nhật'}
                </div>
                {car.totalBookings > 0 && (
                  <>
                    <span className="text-ink-200">•</span>
                    <span className="text-xs text-ink-400">
                      {car.totalBookings} lượt thuê
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* 3. Technical Specs Grid */}
            <div className="card p-5">
              <h3 className="text-base font-bold text-ink-900 mb-4">
                Thông số kỹ thuật
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                <SpecItem icon={Fuel} label="Nhiên liệu" value={fuelLabel} />
                <SpecItem icon={Cog} label="Hộp số" value={transLabel} />
                <SpecItem
                  icon={Users}
                  label="Số chỗ"
                  value={`${car.seats} chỗ`}
                />
                <SpecItem
                  icon={Calendar}
                  label="Năm SX"
                  value={car.modelYear}
                />
                <SpecItem
                  icon={Gauge}
                  label="Dung tích"
                  value={car.engineCapacity || '—'}
                />
              </div>
            </div>

            {/* 4. Amenities / Equipment */}
            <div className="card p-5">
              <h3 className="text-base font-bold text-ink-900 mb-4">
                Trang bị &amp; Tiện nghi
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {AMENITIES.map(({ key, icon: Icon, label }) => (
                  <div
                    key={key}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-ink-50 text-center"
                  >
                    <Icon className="w-5 h-5 text-brand-primary" />
                    <span className="text-[11px] font-medium text-ink-600">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Insurance Comparison Table */}
            <div className="card p-5">
              <h3 className="text-base font-bold text-ink-900 mb-4">
                Bảng so sánh gói bảo hiểm
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink-100">
                      <th className="text-left py-3 px-3 text-ink-500 font-medium w-[40%]">
                        Nội dung
                      </th>
                      <th className="text-center py-3 px-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-ink-500" />
                          <span className="font-semibold text-ink-700">Cơ bản</span>
                        </div>
                      </th>
                      <th className="text-center py-3 px-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <ShieldPlus className="w-4 h-4 text-brand-primary" />
                          <span className="font-semibold text-brand-primary">Premium</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {INSURANCE_ROWS.map((row, i) => (
                      <tr
                        key={i}
                        className={`border-b border-ink-50 ${
                          i % 2 === 0 ? 'bg-ink-50/50' : ''
                        }`}
                      >
                        <td className="py-3 px-3 text-ink-600">{row.label}</td>
                        <td className="py-3 px-3 text-center text-ink-500">
                          {row.basic}
                        </td>
                        <td className="py-3 px-3 text-center font-medium text-brand-primary">
                          {row.premium}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 6. Rental Rules (Collapsible) */}
            <div className="card p-5">
              <h3 className="text-base font-bold text-ink-900 mb-4">
                Quy định thuê xe
              </h3>
              <div className="space-y-2">
                {RENTAL_RULES.map((rule, i) => (
                  <div
                    key={i}
                    className="border border-ink-100 rounded-xl overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedRule(expandedRule === i ? null : i)
                      }
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-ink-50/50 transition"
                    >
                      <div className="flex items-center gap-2">
                        <CircleAlert className="w-4 h-4 text-brand-accent flex-shrink-0" />
                        <span className="text-sm font-semibold text-ink-800">
                          {rule.title}
                        </span>
                      </div>
                      {expandedRule === i ? (
                        <ChevronUp className="w-4 h-4 text-ink-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-ink-400" />
                      )}
                    </button>
                    {expandedRule === i && (
                      <div className="px-4 pb-4 pt-0 text-sm text-ink-600 leading-relaxed border-t border-ink-50">
                        {rule.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 7. Description / About */}
            {car.description && (
              <div className="card p-5">
                <h3 className="text-base font-bold text-ink-900 mb-3">
                  Giới thiệu về xe
                </h3>
                <h4 className="text-sm font-semibold text-ink-700 mb-2">
                  Thuê xe 4-16 chỗ {car.name}
                </h4>
                <p className="text-sm text-ink-600 leading-relaxed whitespace-pre-line">
                  {car.description}
                </p>
              </div>
            )}

            {/* 8. Reviews */}
            <div className="card p-5">
              <h3 className="text-base font-bold text-ink-900 mb-4">
                Đánh giá từ người thuê
              </h3>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewItem key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-ink-400">
                    Chưa có đánh giá nào cho xe này.
                  </p>
                </div>
              )}
            </div>

            {/* 9. Similar Cars */}
            <SimilarCars
              currentCarId={car.id}
              brandSlug={car.brand?.slug}
              categorySlug={car.category?.slug}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────

function SpecItem({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-ink-50 text-center">
      <Icon className="w-5 h-5 text-brand-primary" />
      <div>
        <div className="text-[11px] text-ink-400">{label}</div>
        <div className="text-sm font-semibold text-ink-800">{value}</div>
      </div>
    </div>
  );
}

function ReviewItem({ review }) {
  return (
    <div className="flex gap-3 pb-4 border-b border-ink-50 last:border-0 last:pb-0">
      {/* Avatar */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center overflow-hidden">
        {review.user?.avatarUrl ? (
          <img
            src={review.user.avatarUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-sm font-bold text-brand-primary">
            {review.user?.fullName?.[0] || 'U'}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-ink-800">
            {review.user?.fullName || 'Ẩn danh'}
          </span>
          <span className="text-xs text-ink-400">
            {review.createdAt
              ? new Date(review.createdAt).toLocaleDateString('vi-VN')
              : ''}
          </span>
        </div>
        <Rating value={review.rating || 5} size="sm" />
        {review.content && (
          <p className="mt-1.5 text-sm text-ink-600 leading-relaxed">
            {review.content}
          </p>
        )}
      </div>
    </div>
  );
}