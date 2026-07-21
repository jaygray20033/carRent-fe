// src/pages/booking/PaymentPage.jsx
// Choose a payment method for a PENDING_PAYMENT booking, then create a checkout
// session and redirect the browser to the provider's payUrl (Day 17: VNPay).
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, ShieldCheck, Wallet } from 'lucide-react';
import { bookingService } from '../../services/bookingService.js';
import { paymentService } from '../../services/paymentService.js';
import { formatCurrency, formatDateTime } from '../../utils/format.js';
import Loading from '../../components/common/Loading.jsx';

const METHODS = [
  {
    id: 'VNPAY',
    name: 'VNPay',
    desc: 'Thẻ ATM / QR / Thẻ quốc tế qua cổng VNPay',
    logo: 'https://sandbox.vnpayment.vn/apis/assets/images/logo.svg',
    enabled: true,
  },
  {
    id: 'MOMO',
    name: 'Ví MoMo',
    desc: 'Thanh toán qua ví điện tử MoMo',
    logo: 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png',
    enabled: false,
  },
  {
    id: 'ZALOPAY',
    name: 'ZaloPay',
    desc: 'Thanh toán qua ví ZaloPay',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Logo_Zalopay.svg',
    enabled: false,
  },
  {
    id: 'WALLET',
    name: 'Ví OtoRent',
    desc: 'Trừ trực tiếp từ số dư ví của bạn',
    icon: Wallet,
    enabled: false,
  },
];

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [method, setMethod] = useState('VNPAY');

  const { data, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingService.detail(bookingId),
  });

  const checkoutMutation = useMutation({
    mutationFn: () => paymentService.checkout({ bookingId, method }),
    onSuccess: (res) => {
      const payUrl = res?.data?.payUrl ?? res?.data?.checkoutUrl ?? res?.payUrl;
      if (payUrl) {
        // Hand off to the provider's hosted payment page.
        window.location.href = payUrl;
        return;
      }
      toast.error('Không lấy được liên kết thanh toán');
    },
    onError: (e) => toast.error(e?.message || 'Tạo thanh toán thất bại'),
  });

  if (isLoading) return <Loading />;

  const b = data?.data?.booking ?? data?.data ?? data;
  if (!b || !b.id) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="card p-8 text-center">
          <p className="text-gray-600">Không tìm thấy đơn đặt xe.</p>
          <Link to="/me/bookings" className="mt-4 inline-block text-primary-600 hover:underline">
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  if (b.status !== 'PENDING_PAYMENT') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="card p-8 text-center">
          <p className="text-gray-700">Đơn này không ở trạng thái chờ thanh toán.</p>
          <Link
            to={`/me/bookings/${b.id}`}
            className="mt-4 inline-block text-primary-600 hover:underline"
          >
            Xem chi tiết đơn →
          </Link>
        </div>
      </div>
    );
  }

  const car = b.car || b.vehicle || {};
  const carName = car.name || 'Xe thuê';
  const total = Number(b.totalAmount ?? b.subtotal ?? 0);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại
      </button>

      <div className="card p-6">
        <h1 className="text-xl font-bold text-gray-900">Thanh toán đơn đặt xe</h1>
        <p className="mt-1 text-sm text-gray-500">
          Mã đơn: <span className="font-mono font-semibold">{b.bookingCode}</span>
        </p>

        {/* Order summary */}
        <div className="mt-5 space-y-2 rounded-lg bg-gray-50 p-4 text-sm">
          <Row label="Xe" value={carName} />
          <Row label="Nhận xe" value={formatDateTime(b.pickupAt)} />
          <Row label="Trả xe" value={formatDateTime(b.returnAt)} />
          <Row label="Số ngày" value={`${b.totalDays ?? 1} ngày`} />
          <div className="my-2 border-t border-gray-200" />
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">Tổng thanh toán</span>
            <span className="text-lg font-bold text-primary-600">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Method selection */}
        <h2 className="mt-6 mb-3 text-sm font-semibold text-gray-900">Chọn phương thức</h2>
        <div className="space-y-3">
          {METHODS.map((m) => (
            <MethodCard
              key={m.id}
              method={m}
              checked={method === m.id}
              onSelect={() => m.enabled && setMethod(m.id)}
            />
          ))}
        </div>

        <button
          onClick={() => checkoutMutation.mutate()}
          disabled={checkoutMutation.isPending}
          className="btn-primary mt-6 w-full justify-center disabled:opacity-60"
        >
          {checkoutMutation.isPending
            ? 'Đang chuyển hướng...'
            : `Thanh toán ${formatCurrency(total)}`}
        </button>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          Giao dịch được bảo mật qua cổng thanh toán
        </p>
      </div>
    </div>
  );
}

function MethodCard({ method, checked, onSelect }) {
  const { name, desc, logo, icon: Icon, enabled } = method;
  return (
    <label
      onClick={onSelect}
      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
        !enabled
          ? 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-60'
          : checked
            ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
            : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-gray-100">
        {logo ? (
          <img src={logo} alt={name} className="h-7 w-7 object-contain" />
        ) : Icon ? (
          <Icon className="h-5 w-5 text-primary-600" />
        ) : null}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          {name}
          {!enabled && (
            <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
              Sắp có
            </span>
          )}
        </p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
          checked ? 'border-primary-500' : 'border-gray-300'
        }`}
      >
        {checked && <span className="h-2.5 w-2.5 rounded-full bg-primary-500" />}
      </span>
    </label>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
