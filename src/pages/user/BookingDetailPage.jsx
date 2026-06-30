// src/pages/user/BookingDetailPage.jsx
// Booking detail: status timeline + price breakdown + Pay (PENDING_PAYMENT) / Cancel (UC-20).
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Check, X, CreditCard, MapPin, CalendarClock } from 'lucide-react';
import { bookingService } from '../../services/bookingService.js';
import { formatCurrency, formatDateTime } from '../../utils/format.js';
import {
  TIMELINE_STEPS,
  statusColor,
  statusLabel,
  canCancel,
  needsPayment,
  estimateRefundPercent,
} from '../../utils/bookingStatus.js';
import Loading from '../../components/common/Loading.jsx';
import Modal from '../../components/ui/Modal.jsx';

export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingService.detail(id),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['booking', id] });
    qc.invalidateQueries({ queryKey: ['myBookings'] });
  };

  const cancelMutation = useMutation({
    mutationFn: (reason) => bookingService.cancel(id, reason || 'User cancelled'),
    onSuccess: () => {
      toast.success('Đã hủy đơn');
      setShowCancel(false);
      invalidate();
    },
    onError: (e) => toast.error(e?.message || 'Hủy thất bại'),
  });

  if (isLoading) return <Loading />;

  const b = data?.data?.booking ?? data?.data ?? data;
  if (!b || !b.id) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100">
        <p className="text-gray-600">Không tìm thấy đơn đặt xe.</p>
        <Link to="/me/bookings" className="mt-4 inline-block text-blue-700 hover:underline">
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  const car = b.car || b.vehicle || {};
  const carName =
    car.name ||
    [car.brand?.name, car.model?.name].filter(Boolean).join(' ') ||
    'Xe thuê';
  const thumb =
    car.thumbnailUrl || car.images?.[0]?.url || 'https://placehold.co/240x150?text=Car';

  const subtotal = Number(b.subtotal ?? b.base_price ?? 0);
  const insuranceFee = Number(b.insuranceFee ?? b.insurance_total ?? 0);
  const discount = Number(b.discountAmount ?? b.discount_amount ?? 0);
  const total = Number(b.totalAmount ?? b.total_price ?? subtotal + insuranceFee - discount);

  // Timeline progress
  const isCancelled = b.status === 'CANCELLED' || b.status === 'REFUNDED';
  const currentIdx = TIMELINE_STEPS.findIndex((s) => s.status === b.status);

  // UC-20 refund preview for the cancel modal (based on time to pickup).
  const pickupAt = b.pickupAt ?? b.start_date;
  const refundPercent = estimateRefundPercent(pickupAt);
  const estRefundAmount =
    refundPercent != null ? Math.round((total * refundPercent) / 100) : 0;
  // Only PENDING_PAYMENT / CONFIRMED carry a paid amount worth refunding.
  const hasPaidAmount = ['CONFIRMED'].includes(b.status);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/me/bookings')}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>
        <span
          className={`rounded-md px-2.5 py-1 text-xs font-semibold ${statusColor(b.status)}`}
        >
          {statusLabel(b.status)}
        </span>
      </div>

      {/* Car + meta */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <div className="flex flex-col gap-4 sm:flex-row">
          <img src={thumb} alt={carName} className="h-28 w-44 rounded-xl object-cover" />
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold text-gray-900">{carName}</h1>
            <p className="mt-0.5 text-xs text-gray-500">
              Mã đơn: <span className="font-mono">{b.bookingCode || b.booking_code}</span>
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-600 sm:grid-cols-2">
              <span className="inline-flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-gray-400" />
                Nhận: {formatDateTime(b.pickupAt ?? b.start_date)}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-gray-400" />
                Trả: {formatDateTime(b.returnAt ?? b.end_date)}
              </span>
              {(b.pickupStation?.name || b.pickup_location) && (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {b.pickupStation?.name || b.pickup_location}
                </span>
              )}
              <span>{b.totalDays ?? b.num_days ?? 1} ngày</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status timeline */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Trạng thái đơn</h2>
        {isCancelled ? (
          <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-700">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
              <X className="h-4 w-4" />
            </span>
            <div>
              <p className="font-medium">{statusLabel(b.status)}</p>
              {(b.cancelReason || b.cancel_reason) && (
                <p className="text-xs text-red-600">
                  Lý do: {b.cancelReason || b.cancel_reason}
                </p>
              )}
              {b.refundAmount > 0 && (
                <p className="text-xs text-red-600">
                  Hoàn {b.refundPercent}% ({formatCurrency(b.refundAmount)}) —{' '}
                  {b.refundStatus === 'REFUNDED'
                    ? 'đã hoàn vào ví'
                    : 'đang xử lý hoàn tiền'}
                </p>
              )}
            </div>
          </div>
        ) : (
          <ol className="flex items-center">
            {TIMELINE_STEPS.map((step, idx) => {
              const done = idx <= currentIdx;
              const isLast = idx === TIMELINE_STEPS.length - 1;
              return (
                <li
                  key={step.status}
                  className={`flex items-center ${isLast ? '' : 'flex-1'}`}
                >
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                        done
                          ? 'bg-blue-900 text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {done ? <Check className="h-4 w-4" /> : idx + 1}
                    </span>
                    <span
                      className={`mt-2 w-20 text-center text-[11px] ${
                        done ? 'font-medium text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {!isLast && (
                    <span
                      className={`mx-1 h-0.5 flex-1 ${
                        idx < currentIdx ? 'bg-blue-900' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Price breakdown */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Chi tiết giá</h2>
        <div className="space-y-2 text-sm">
          <Row
            label={`Đơn giá / ngày × ${b.totalDays ?? b.num_days ?? 1} ngày`}
            value={formatCurrency(b.pricePerDay ?? b.price_per_day)}
          />
          <Row label="Tạm tính" value={formatCurrency(subtotal)} />
          {insuranceFee > 0 && (
            <Row label="Bảo hiểm" value={formatCurrency(insuranceFee)} />
          )}
          {discount > 0 && (
            <Row label="Giảm giá" value={`- ${formatCurrency(discount)}`} negative />
          )}
          <div className="my-2 border-t border-gray-100" />
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">Tổng cộng</span>
            <span className="text-lg font-bold text-blue-700">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {(needsPayment(b.status) || canCancel(b.status)) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          {canCancel(b.status) && (
            <button
              onClick={() => setShowCancel(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 px-5 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <X className="h-4 w-4" />
              Hủy đơn
            </button>
          )}
          {needsPayment(b.status) && (
            <button
              onClick={() => navigate(`/payment/${b.id}`)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-60"
            >
              <CreditCard className="h-4 w-4" />
              Thanh toán
            </button>
          )}
        </div>
      )}

      {/* Cancel confirmation modal */}
      <Modal open={showCancel} onClose={() => setShowCancel(false)} title="Hủy đơn đặt xe">
        <p className="text-sm text-gray-600">
          Bạn có chắc chắn muốn hủy đơn này không? Hành động này không thể hoàn tác.
        </p>

        {/* UC-20 refund preview */}
        {hasPaidAmount && refundPercent != null && (
          <div className="mt-3 rounded-xl bg-amber-50 p-3 ring-1 ring-amber-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-amber-800">Hoàn tiền dự kiến ({refundPercent}%)</span>
              <span className="font-semibold text-amber-900">
                {formatCurrency(estRefundAmount)}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-amber-700">
              Mức hoàn theo thời điểm hủy: ≥48h trước nhận xe hoàn 100%, 24-48h hoàn 70%,
              dưới 24h hoàn 30%. Tiền hoàn được cộng vào ví của bạn.
            </p>
          </div>
        )}
        {hasPaidAmount && refundPercent == null && (
          <div className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700 ring-1 ring-red-100">
            Đã qua thời điểm nhận xe — đơn này không thể hủy.
          </div>
        )}

        <textarea
          rows={3}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Lý do hủy (không bắt buộc)"
          className="mt-3 w-full rounded-lg border border-gray-200 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => setShowCancel(false)}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Đóng
          </button>
          <button
            onClick={() => cancelMutation.mutate(cancelReason)}
            disabled={cancelMutation.isPending}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {cancelMutation.isPending ? 'Đang hủy...' : 'Xác nhận hủy'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function Row({ label, value, negative }) {
  return (
    <div className="flex items-center justify-between text-gray-700">
      <span>{label}</span>
      <span className={negative ? 'text-emerald-600' : 'text-gray-900'}>{value}</span>
    </div>
  );
}
