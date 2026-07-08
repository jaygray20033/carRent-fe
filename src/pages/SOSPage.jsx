// src/pages/SOSPage.jsx — Day 39 (UC-34/35).
// Roadside SOS wizard for an in-use booking:
//   1) capture geolocation → 2) pick issue type → 3) describe + photos → submit,
// then poll the request status every 30s until resolved/cancelled.
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ArrowLeft,
  MapPin,
  LifeBuoy,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  Phone,
  Truck,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { sosService } from '../services/sosService.js';
import { bookingService } from '../services/bookingService.js';
import { formatDateTime } from '../utils/format.js';
import Button from '../components/ui/Button.jsx';
import Loading from '../components/common/Loading.jsx';

const ISSUE_TYPES = [
  { value: 'FLAT_TIRE', label: 'Thủng / xịt lốp', icon: '🛞' },
  { value: 'DEAD_BATTERY', label: 'Hết / yếu ắc quy', icon: '🔋' },
  { value: 'OUT_OF_FUEL', label: 'Hết nhiên liệu', icon: '⛽' },
  { value: 'ENGINE', label: 'Lỗi động cơ', icon: '⚙️' },
  { value: 'ACCIDENT', label: 'Tai nạn / va chạm', icon: '💥' },
  { value: 'LOCKED_OUT', label: 'Kẹt khóa / mất chìa', icon: '🔑' },
  { value: 'OTHER', label: 'Sự cố khác', icon: '❓' },
];

const STATUS_META = {
  REQUESTED: { label: 'Đã tiếp nhận', tone: 'bg-warning/10 text-warning', icon: Loader2, spin: true },
  DISPATCHED: { label: 'Đã điều động', tone: 'bg-info/10 text-info', icon: Truck },
  ON_THE_WAY: { label: 'Đang trên đường', tone: 'bg-info/10 text-info', icon: Truck },
  RESOLVED: { label: 'Đã hoàn tất', tone: 'bg-success/10 text-success', icon: CheckCircle2 },
  CANCELLED: { label: 'Đã huỷ', tone: 'bg-danger/10 text-danger', icon: XCircle },
};

const OPEN = ['REQUESTED', 'DISPATCHED', 'ON_THE_WAY'];

export default function SOSPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [coords, setCoords] = useState(null); // { lat, lng }
  const [geoError, setGeoError] = useState(() =>
    typeof navigator !== 'undefined' && !navigator.geolocation
      ? 'Trình duyệt không hỗ trợ định vị. Vui lòng nhập vị trí thủ công.'
      : ''
  );
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  // Booking guard — SOS only valid while IN_USE.
  const { data: bookingData, isLoading: bookingLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingService.detail(bookingId),
  });
  const booking = bookingData?.data?.booking ?? bookingData?.data ?? bookingData;

  // Existing SOS requests for this booking (also used for status polling once submitted).
  const { data: sosData, refetch } = useQuery({
    queryKey: ['sosForBooking', bookingId],
    queryFn: () => sosService.listForBooking(bookingId),
    refetchInterval: submitted ? 30000 : false,
  });
  const activeRequest = useMemo(() => {
    const requests = sosData?.data?.items ?? [];
    return requests.find((r) => OPEN.includes(r.status)) || requests[0] || null;
  }, [sosData]);

  // An open request means we're already tracking — derived, no effect needed.
  const hasOpenRequest = !!activeRequest && OPEN.includes(activeRequest.status);
  const showTracking = submitted || hasOpenRequest;

  // Capture geolocation on mount. The synchronous "unsupported" case is handled
  // in the geoError initializer so we never call setState directly in the effect.
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setGeoError('Không lấy được vị trí. Hãy cho phép truy cập định vị rồi thử lại.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const mutation = useMutation({
    mutationFn: () =>
      sosService.submit(
        {
          bookingId,
          lat: coords.lat,
          lng: coords.lng,
          issueType,
          description: description.trim(),
        },
        files
      ),
    onSuccess: () => {
      toast.success('Đã gửi yêu cầu cứu hộ. Đội ngũ sẽ liên hệ ngay.');
      setSubmitted(true);
      refetch();
    },
    onError: (e) => toast.error(e?.message || 'Gửi yêu cầu thất bại, vui lòng thử lại.'),
  });

  const onFiles = (e) => setFiles(Array.from(e.target.files || []).slice(0, 6));

  const canSubmit = coords && issueType && !mutation.isPending;

  if (bookingLoading) return <div className="container-app py-10"><Loading /></div>;

  // Guard: booking must be IN_USE (unless we already have a request to track).
  const isInUse = booking?.status === 'IN_USE';
  if (!showTracking && booking && !isInUse && !activeRequest) {
    return (
      <div className="container-app py-10">
        <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 text-center shadow-card ring-1 ring-ink-100">
          <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-warning" />
          <h1 className="text-lg font-bold text-ink-900">Chưa thể gửi cứu hộ</h1>
          <p className="mt-2 text-sm text-ink-500">
            Cứu hộ chỉ khả dụng khi xe đang trong chuyến (đã nhận xe). Vui lòng liên hệ hotline nếu
            cần hỗ trợ khẩn cấp.
          </p>
          <Link
            to={`/me/bookings/${bookingId}`}
            className="mt-4 inline-block text-sm font-medium text-brand-primary hover:underline"
          >
            ← Về chi tiết đơn
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8 lg:py-10">
      <button
        onClick={() => navigate(`/me/bookings/${bookingId}`)}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Về chi tiết đơn
      </button>

      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-danger/10 text-danger">
            <LifeBuoy className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-ink-900">Cứu hộ khẩn cấp (SOS)</h1>
            <p className="text-sm text-ink-500">
              Đơn {booking?.bookingCode || `#${bookingId}`}
            </p>
          </div>
        </div>

        {showTracking && activeRequest ? (
          <TrackingCard request={activeRequest} onNew={() => setSubmitted(false)} />
        ) : (
          <div className="space-y-5 rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink-100">
            {/* Location */}
            <section>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-800">
                <MapPin className="h-4 w-4 text-brand-primary" />
                Vị trí của bạn
              </h2>
              {coords ? (
                <div className="rounded-xl bg-success/5 p-3 text-sm text-ink-700 ring-1 ring-success/20">
                  Đã xác định vị trí: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                </div>
              ) : geoError ? (
                <div className="space-y-2">
                  <p className="rounded-xl bg-danger/5 p-3 text-sm text-danger ring-1 ring-danger/20">
                    {geoError}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      step="any"
                      placeholder="Vĩ độ (lat)"
                      className="input"
                      onChange={(e) =>
                        setCoords((c) => ({ ...(c || {}), lat: Number(e.target.value) }))
                      }
                    />
                    <input
                      type="number"
                      step="any"
                      placeholder="Kinh độ (lng)"
                      className="input"
                      onChange={(e) =>
                        setCoords((c) => ({ ...(c || {}), lng: Number(e.target.value) }))
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl bg-ink-50 p-3 text-sm text-ink-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xác định vị trí…
                </div>
              )}
            </section>

            {/* Issue type */}
            <section>
              <h2 className="mb-2 text-sm font-semibold text-ink-800">Loại sự cố *</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ISSUE_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setIssueType(t.value)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
                      issueType === t.value
                        ? 'border-brand-primary bg-brand-primary/5 font-medium text-brand-primary'
                        : 'border-ink-200 text-ink-600 hover:bg-ink-50'
                    }`}
                  >
                    <span aria-hidden>{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Description + photos */}
            <section>
              <h2 className="mb-2 text-sm font-semibold text-ink-800">Mô tả chi tiết</h2>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả tình trạng xe, dấu hiệu bất thường…"
                className="input"
              />
              <div className="mt-3">
                <label className="mb-1.5 block text-sm font-medium text-ink-700">
                  Ảnh hiện trường (tối đa 6)
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  multiple
                  onChange={onFiles}
                  className="block w-full text-sm text-ink-500 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-primary/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-primary hover:file:bg-brand-primary/20"
                />
                {files.length > 0 && (
                  <p className="mt-1 text-xs text-ink-400">Đã chọn {files.length} ảnh.</p>
                )}
              </div>
            </section>

            <Button
              variant="primary"
              size="lg"
              onClick={() => mutation.mutate()}
              disabled={!canSubmit}
              loading={mutation.isPending}
              leftIcon={<Send className="h-4 w-4" />}
            >
              Gửi yêu cầu cứu hộ
            </Button>
            {!coords && (
              <p className="text-center text-xs text-ink-400">
                Cần có vị trí để gửi yêu cầu.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TrackingCard({ request, onNew }) {
  const meta = STATUS_META[request.status] || STATUS_META.REQUESTED;
  const Icon = meta.icon;
  const station = request.rescueStation;
  const isClosed = ['RESOLVED', 'CANCELLED'].includes(request.status);

  return (
    <div className="space-y-4 rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink-100">
      <div className="flex items-center gap-3">
        <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${meta.tone}`}>
          <Icon className={`h-6 w-6 ${meta.spin ? 'animate-spin' : ''}`} />
        </span>
        <div>
          <p className="text-xs font-medium uppercase text-ink-400">Trạng thái</p>
          <p className="text-lg font-bold text-ink-900">{meta.label}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {station && (
          <Info label="Trạm cứu hộ" value={station.name} />
        )}
        {request.distanceKm != null && (
          <Info label="Khoảng cách" value={`${request.distanceKm.toFixed(1)} km`} />
        )}
        {request.estimatedArrival && (
          <Info label="Dự kiến đến" value={formatDateTime(request.estimatedArrival)} />
        )}
        {request.driverName && (
          <Info label="Tài xế cứu hộ" value={request.driverName} />
        )}
      </div>

      {(station?.phone || request.driverPhone) && (
        <a
          href={`tel:${request.driverPhone || station?.phone}`}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary/90"
        >
          <Phone className="h-4 w-4" />
          Gọi {request.driverPhone ? 'tài xế' : 'trạm cứu hộ'}
        </a>
      )}

      {request.replacementBooking && (
        <Link
          to={`/me/bookings/${request.replacementBooking.id}`}
          className="block rounded-xl bg-success/5 p-3 text-sm text-success ring-1 ring-success/20 hover:bg-success/10"
        >
          Đã có xe thay thế: {request.replacementBooking.bookingCode} — xem chi tiết →
        </Link>
      )}

      {request.resolutionNote && (
        <p className="rounded-xl bg-ink-50 p-3 text-sm text-ink-600">{request.resolutionNote}</p>
      )}

      {!isClosed && (
        <p className="text-center text-xs text-ink-400">
          Trang tự động cập nhật mỗi 30 giây.
        </p>
      )}

      {isClosed && (
        <button
          onClick={onNew}
          className="w-full rounded-xl border border-ink-200 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-50"
        >
          Gửi yêu cầu mới
        </button>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-ink-400">{label}</p>
      <p className="text-sm font-medium text-ink-700">{value}</p>
    </div>
  );
}
