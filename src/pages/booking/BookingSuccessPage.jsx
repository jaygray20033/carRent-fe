import { Link, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../../services/bookingService.js';
import { formatCurrency, formatDateTime } from '../../utils/format.js';
import Loading from '../../components/common/Loading.jsx';

export default function BookingSuccessPage() {
  const { bookingId } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingService.detail(bookingId),
  });

  if (isLoading) return <Loading />;
  const b = data?.data?.booking;
  if (!b) return <div className="p-8 text-center">Không tìm thấy đơn.</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="card p-8 text-center">
        <div className="mx-auto mb-3 inline-flex rounded-full bg-emerald-50 p-3 text-emerald-600">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Đặt xe thành công!</h1>
        <p className="mt-1 text-sm text-gray-500">
          Mã đơn của bạn: <span className="font-mono font-semibold">{b.bookingCode}</span>
        </p>

        <div className="mt-6 space-y-2 rounded-lg bg-gray-50 p-4 text-left text-sm">
          <Row label="Xe" value={b.car?.name} />
          <Row label="Nhận xe" value={formatDateTime(b.pickupAt)} />
          <Row label="Trả xe" value={formatDateTime(b.returnAt)} />
          <Row label="Số ngày" value={`${b.totalDays} ngày`} />
          <Row label="Tổng tiền" value={formatCurrency(b.totalAmount)} highlight />
        </div>

        <div className="mt-6 flex justify-center gap-2">
          <Link to="/me/bookings" className="btn-outline">
            Xem các đơn của tôi
          </Link>
          <Link to="/cars" className="btn-primary">
            Tiếp tục thuê xe
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      <span className={highlight ? 'text-lg font-bold text-primary-600' : 'font-medium text-gray-900'}>
        {value}
      </span>
    </div>
  );
}
