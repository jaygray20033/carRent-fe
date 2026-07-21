// src/pages/admin/BookingDetailAdminPage.jsx
// Admin booking detail (Day 33 — UC-54). Full booking info + payments +
// action buttons (confirm payment / start / return / refund / note) and a
// history timeline. Actions are gated by the booking's current status.
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle2,
  PlayCircle,
  RotateCcw,
  Undo2,
  StickyNote,
  MapPin,
  CalendarClock,
  Phone,
  Mail,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminBookingService } from '../../services/adminService.js';
import { formatCurrency, formatDateTime } from '../../utils/format.js';
import { statusLabel, statusColor } from '../../utils/bookingStatus.js';
import Button from '../../components/ui/Button.jsx';
import Select from '../../components/ui/Select.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import Input from '../../components/ui/Input.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Loading from '../../components/common/Loading.jsx';

const unwrap = (res) => res?.data ?? res ?? {};

const PAYMENT_STATUS_COLOR = {
  SUCCESS: 'bg-emerald-100 text-emerald-700',
  PENDING: 'bg-amber-100 text-amber-700',
  FAILED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-gray-100 text-gray-700',
};

export default function BookingDetailAdminPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMethod, setConfirmMethod] = useState('BANK_TRANSFER');
  const [returnOpen, setReturnOpen] = useState(false);
  const [extraFee, setExtraFee] = useState('');
  const [returnNote, setReturnNote] = useState('');
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundPercent, setRefundPercent] = useState('100');
  const [refundReason, setRefundReason] = useState('');
  const [note, setNote] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminBooking', id],
    queryFn: () => adminBookingService.detail(id),
  });

  const b = unwrap(data)?.booking ?? unwrap(data);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['adminBooking', id] });
    queryClient.invalidateQueries({ queryKey: ['adminBookings'] });
  };

  const confirmMutation = useMutation({
    mutationFn: (payload) => adminBookingService.confirmPayment(id, payload),
    onSuccess: () => {
      toast.success('Đã xác nhận thanh toán');
      setConfirmOpen(false);
      invalidate();
    },
    onError: (e) => toast.error(e?.message || 'Không thể xác nhận thanh toán'),
  });

  const startMutation = useMutation({
    mutationFn: () => adminBookingService.start(id),
    onSuccess: () => {
      toast.success('Đã bắt đầu chuyến');
      invalidate();
    },
    onError: (e) => toast.error(e?.message || 'Không thể bắt đầu chuyến'),
  });

  const returnMutation = useMutation({
    mutationFn: (payload) => adminBookingService.return(id, payload),
    onSuccess: () => {
      toast.success('Đã tất toán chuyến');
      setReturnOpen(false);
      setExtraFee('');
      setReturnNote('');
      invalidate();
    },
    onError: (e) => toast.error(e?.message || 'Không thể tất toán chuyến'),
  });

  const refundMutation = useMutation({
    mutationFn: (payload) => adminBookingService.refund(id, payload),
    onSuccess: () => {
      toast.success('Đã hoàn tiền đơn');
      setRefundOpen(false);
      setRefundReason('');
      invalidate();
    },
    onError: (e) => toast.error(e?.message || 'Không thể hoàn tiền'),
  });

  const noteMutation = useMutation({
    mutationFn: (text) => adminBookingService.addNote(id, text),
    onSuccess: () => {
      toast.success('Đã thêm ghi chú');
      setNote('');
      invalidate();
    },
    onError: (e) => toast.error(e?.message || 'Không thể thêm ghi chú'),
  });

  if (isLoading) return <Loading />;

  if (!b || !b.id) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-ink-100">
        <p className="text-ink-500">Không tìm thấy đơn thuê.</p>
        <button
          onClick={() => navigate('/admin/bookings')}
          className="mt-4 text-brand-primary hover:underline"
        >
          ← Quay lại danh sách
        </button>
      </div>
    );
  }

  const car = b.vehicle || {};
  const carName = car.name || [car.brand?.name, car.model?.name].filter(Boolean).join(' ') || 'Xe';
  const history = Array.isArray(b.history) ? b.history : [];
  const payments = Array.isArray(b.payments) ? b.payments : [];

  const canConfirm = b.status === 'PENDING_PAYMENT';
  const canStart = b.status === 'CONFIRMED';
  const canReturn = b.status === 'IN_USE';
  const canRefund = ['CONFIRMED', 'PAID', 'IN_USE', 'PENDING_PAYMENT'].includes(b.status);

  const parseMeta = (m) => {
    if (!m) return {};
    try {
      return typeof m === 'string' ? JSON.parse(m) : m;
    } catch {
      return {};
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate('/admin/bookings')}
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-ink-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>
        <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${statusColor(b.status)}`}>
          {statusLabel(b.status)}
        </span>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap gap-2">
        {canConfirm && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<CheckCircle2 className="h-4 w-4" />}
            onClick={() => setConfirmOpen(true)}
          >
            Xác nhận thanh toán
          </Button>
        )}
        {canStart && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<PlayCircle className="h-4 w-4" />}
            onClick={() => startMutation.mutate()}
            disabled={startMutation.isPending}
          >
            Bắt đầu chuyến
          </Button>
        )}
        {canReturn && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<RotateCcw className="h-4 w-4" />}
            onClick={() => setReturnOpen(true)}
          >
            Tất toán chuyến
          </Button>
        )}
        {canRefund && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Undo2 className="h-4 w-4" />}
            onClick={() => setRefundOpen(true)}
          >
            Hoàn tiền
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left column — booking + customer + vehicle + payments */}
        <div className="space-y-5 lg:col-span-2">
          {/* Booking meta */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-lg font-bold text-ink-700">{carName}</h1>
                <p className="mt-0.5 text-xs text-ink-300">
                  Mã đơn: <span className="font-mono">{b.bookingCode}</span>
                </p>
              </div>
              {car.licensePlate && (
                <span className="rounded-md bg-ink-50 px-2 py-1 font-mono text-xs text-ink-500">
                  {car.licensePlate}
                </span>
              )}
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-ink-500 sm:grid-cols-2">
              <span className="inline-flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-ink-300" />
                Nhận: {formatDateTime(b.pickupAt)}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-ink-300" />
                Trả: {formatDateTime(b.returnAt)}
              </span>
              {b.pickupStation?.name && (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-ink-300" />
                  Nhận: {b.pickupStation.name}
                </span>
              )}
              {b.dropoffStation?.name && (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-ink-300" />
                  Trả: {b.dropoffStation.name}
                </span>
              )}
            </div>
          </div>

          {/* Customer */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
            <h2 className="mb-3 text-sm font-semibold text-ink-700">Khách hàng</h2>
            <div className="space-y-1.5 text-sm text-ink-500">
              <p className="font-medium text-ink-700">{b.user?.fullName || '—'}</p>
              {b.user?.phone && (
                <p className="inline-flex items-center gap-2">
                  <Phone className="h-4 w-4 text-ink-300" />
                  {b.user.phone}
                </p>
              )}
              {b.user?.email && (
                <p className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4 text-ink-300" />
                  {b.user.email}
                </p>
              )}
            </div>
          </div>

          {/* Payments */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
            <h2 className="mb-3 text-sm font-semibold text-ink-700">Thanh toán</h2>
            {payments.length === 0 ? (
              <p className="text-sm text-ink-300">Chưa có giao dịch nào.</p>
            ) : (
              <div className="space-y-2">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl bg-ink-50/60 px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium text-ink-700">
                        {p.method} · {p.type}
                      </p>
                      <p className="text-xs text-ink-300">{formatDateTime(p.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-ink-700">{formatCurrency(p.amount)}</p>
                      <span
                        className={`inline-flex rounded px-1.5 py-0.5 text-[11px] font-medium ${
                          PAYMENT_STATUS_COLOR[p.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column — price + note + timeline */}
        <div className="space-y-5">
          {/* Price */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
            <h2 className="mb-3 text-sm font-semibold text-ink-700">Chi phí</h2>
            <div className="space-y-2 text-sm">
              <Row label="Tạm tính" value={formatCurrency(b.subtotal)} />
              {b.insuranceFee > 0 && <Row label="Bảo hiểm" value={formatCurrency(b.insuranceFee)} />}
              {b.discountAmount > 0 && (
                <Row label="Giảm giá" value={`- ${formatCurrency(b.discountAmount)}`} />
              )}
              {b.extraFee > 0 && <Row label="Phụ phí" value={formatCurrency(b.extraFee)} />}
              <div className="my-1 border-t border-ink-100" />
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink-700">Tổng cộng</span>
                <span className="text-lg font-bold text-brand-primary">
                  {formatCurrency(b.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Internal note */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-700">
              <StickyNote className="h-4 w-4" />
              Ghi chú nội bộ
            </h2>
            <Textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Thêm ghi chú vào lịch sử đơn…"
            />
            <div className="mt-2 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => noteMutation.mutate(note.trim())}
                disabled={!note.trim() || noteMutation.isPending}
              >
                Lưu ghi chú
              </Button>
            </div>
          </div>

          {/* History timeline */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
            <h2 className="mb-3 text-sm font-semibold text-ink-700">Lịch sử</h2>
            {history.length === 0 ? (
              <p className="text-sm text-ink-300">Chưa có lịch sử.</p>
            ) : (
              <ol className="space-y-3">
                {history.map((h) => {
                  const meta = parseMeta(h.metadata);
                  const isNote = meta.internalNote;
                  return (
                    <li key={h.id} className="flex gap-3">
                      <span
                        className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                          isNote ? 'bg-ink-300' : 'bg-brand-primary'
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="text-sm text-ink-700">
                          {isNote ? (
                            <span className="font-medium">Ghi chú</span>
                          ) : (
                            <>
                              <span className="text-ink-300">{statusLabel(h.fromStatus)}</span>
                              {' → '}
                              <span className="font-medium">{statusLabel(h.toStatus)}</span>
                            </>
                          )}
                        </p>
                        {h.note && <p className="text-xs text-ink-500">{h.note}</p>}
                        <p className="text-[11px] text-ink-300">{formatDateTime(h.createdAt)}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      </div>

      {/* Confirm payment modal */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Xác nhận thanh toán">
        <p className="text-sm text-ink-500">
          Xác nhận đã nhận thanh toán offline cho đơn <span className="font-mono">{b.bookingCode}</span>.
          Đơn sẽ chuyển sang trạng thái đã xác nhận.
        </p>
        <div className="mt-4">
          <Select
            label="Phương thức"
            value={confirmMethod}
            onChange={(e) => setConfirmMethod(e.target.value)}
            options={[
              { value: 'BANK_TRANSFER', label: 'Chuyển khoản' },
              { value: 'CASH', label: 'Tiền mặt' },
            ]}
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(false)}>
            Đóng
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => confirmMutation.mutate({ method: confirmMethod })}
            disabled={confirmMutation.isPending}
          >
            Xác nhận
          </Button>
        </div>
      </Modal>

      {/* Return modal */}
      <Modal open={returnOpen} onClose={() => setReturnOpen(false)} title="Tất toán chuyến">
        <p className="text-sm text-ink-500">Ghi nhận trả xe và phụ phí (nếu có).</p>
        <div className="mt-4 space-y-3">
          <Input
            type="number"
            label="Phụ phí (nhiên liệu / sạc / hư hỏng)"
            value={extraFee}
            onChange={(e) => setExtraFee(e.target.value)}
            placeholder="0"
            min="0"
          />
          <Textarea
            label="Ghi chú"
            rows={2}
            value={returnNote}
            onChange={(e) => setReturnNote(e.target.value)}
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setReturnOpen(false)}>
            Đóng
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() =>
              returnMutation.mutate({
                ...(extraFee ? { extraFee: Number(extraFee) } : {}),
                ...(returnNote.trim() ? { note: returnNote.trim() } : {}),
              })
            }
            disabled={returnMutation.isPending}
          >
            Tất toán
          </Button>
        </div>
      </Modal>

      {/* Refund modal */}
      <Modal open={refundOpen} onClose={() => setRefundOpen(false)} title="Hoàn tiền (admin)">
        <p className="text-sm text-ink-500">
          Hoàn tiền override — bỏ qua khung thời gian hủy. Tiền hoàn vào ví khách.
        </p>
        <div className="mt-4 space-y-3">
          <Input
            type="number"
            label="Tỷ lệ hoàn (%)"
            value={refundPercent}
            onChange={(e) => setRefundPercent(e.target.value)}
            min="0"
            max="100"
          />
          <Textarea
            label="Lý do"
            rows={2}
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setRefundOpen(false)}>
            Đóng
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() =>
              refundMutation.mutate({
                refundPercent: Number(refundPercent),
                ...(refundReason.trim() ? { reason: refundReason.trim() } : {}),
              })
            }
            disabled={refundMutation.isPending}
          >
            Hoàn tiền
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-ink-500">
      <span>{label}</span>
      <span className="text-ink-700">{value}</span>
    </div>
  );
}
