// src/pages/user/PaymentHistoryPage.jsx
// UC-47 — "Lịch sử thanh toán". Figma: UserAccount-PaymentHistory.png — a card
// per payment: car image + name + model year + rental period on the left, and
// status / payment code / method on the right.
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Receipt, Car } from 'lucide-react';
import { paymentService } from '../../services/paymentService.js';
import Loading from '../../components/common/Loading.jsx';
import Select from '../../components/ui/Select.jsx';

const STATUS_META = {
  SUCCESS: { label: 'Thanh toán thành công', cls: 'bg-green-50 text-green-600' },
  PENDING: { label: 'Chờ thanh toán', cls: 'bg-amber-50 text-amber-600' },
  FAILED: { label: 'Thanh toán thất bại', cls: 'bg-danger/10 text-danger' },
  REFUNDED: { label: 'Đã hoàn tiền', cls: 'bg-blue-50 text-blue-600' },
};

const METHOD_LABELS = {
  VNPAY: 'VNPay',
  MOMO: 'MoMo',
  ZALOPAY: 'ZaloPay',
  WALLET: 'Ví OtoRent',
  BANK_TRANSFER: 'Chuyển khoản ngân hàng',
  CASH: 'Tiền mặt',
};

const TYPE_LABELS = { BOOKING: 'Đặt xe', TOPUP: 'Nạp ví' };

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'SUCCESS', label: 'Thành công' },
  { value: 'PENDING', label: 'Chờ thanh toán' },
  { value: 'FAILED', label: 'Thất bại' },
  { value: 'REFUNDED', label: 'Đã hoàn tiền' },
];

const TYPE_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả loại' },
  { value: 'BOOKING', label: 'Đặt xe' },
  { value: 'TOPUP', label: 'Nạp ví' },
];

const fmtVnd = (n) => `${Number(n || 0).toLocaleString('vi-VN')} VND`;
const fmtDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (x) => String(x).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

function PaymentCard({ p }) {
  const status = STATUS_META[p.status] || { label: p.status, cls: 'bg-ink-50 text-ink-500' };
  const vehicle = p.booking?.vehicle;
  const isBooking = p.type === 'BOOKING';

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-ink-100 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        {vehicle?.thumbnailUrl ? (
          <img
            src={vehicle.thumbnailUrl}
            alt={vehicle.name}
            className="h-20 w-28 shrink-0 rounded-xl object-cover ring-1 ring-ink-100"
          />
        ) : (
          <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-ink-300">
            {isBooking ? <Car className="h-7 w-7" /> : <Receipt className="h-7 w-7" />}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink-900">
            {vehicle?.name || (isBooking ? 'Đơn đặt xe' : 'Nạp tiền vào ví')}
          </p>
          {vehicle?.modelYear && (
            <p className="text-sm text-ink-400">Năm sản xuất : {vehicle.modelYear}</p>
          )}
          {isBooking && p.booking?.pickupAt && (
            <p className="text-sm text-ink-400">
              Thời hạn thuê : {fmtDate(p.booking.pickupAt)} - {fmtDate(p.booking.returnAt)}
            </p>
          )}
          <p className="text-sm text-ink-400">Loại : {TYPE_LABELS[p.type] || p.type}</p>
        </div>
      </div>

      <div className="shrink-0 sm:text-right">
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${status.cls}`}>
          {status.label}
        </span>
        <p className="mt-2 text-lg font-bold text-ink-900">{fmtVnd(p.amount)}</p>
        <p className="mt-1 text-xs text-ink-400">
          Mã thanh toán : {p.txnRef || p.transactionId || `#${p.id}`}
        </p>
        <p className="text-xs text-ink-400">
          Phương thức : {METHOD_LABELS[p.method] || p.method}
        </p>
        <p className="text-xs text-ink-400">{fmtDate(p.createdAt)}</p>
      </div>
    </div>
  );
}

export default function PaymentHistoryPage() {
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['payments', status, type],
    queryFn: () =>
      paymentService.listMine({
        ...(status ? { status } : {}),
        ...(type ? { type } : {}),
      }),
  });

  const payments = data?.data?.payments ?? [];

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink-100 md:p-8">
      <div className="mb-6 flex flex-col gap-4 border-b border-ink-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-ink-900">Lịch sử thanh toán</h1>
        <div className="flex gap-3">
          <Select value={type} onChange={(e) => setType(e.target.value)} options={TYPE_FILTER_OPTIONS} />
          <Select value={status} onChange={(e) => setStatus(e.target.value)} options={STATUS_FILTER_OPTIONS} />
        </div>
      </div>

      {isLoading ? (
        <Loading />
      ) : payments.length === 0 ? (
        <div className="py-16 text-center">
          <Receipt className="mx-auto mb-3 h-10 w-10 text-ink-200" />
          <p className="text-ink-500">Chưa có giao dịch thanh toán nào.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((p) => (
            <PaymentCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
