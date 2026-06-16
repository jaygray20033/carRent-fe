import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { bookingService } from '../../services/bookingService.js';
import { formatCurrency, formatDateTime } from '../../utils/format.js';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

const statusColor = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING_PAYMENT: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  IN_USE: 'bg-indigo-100 text-indigo-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-gray-100 text-gray-700',
};

export default function MyBookingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['myBookings'],
    queryFn: () => bookingService.listMy({ page: 1, limit: 20 }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => bookingService.cancel(id, 'User cancelled'),
    onSuccess: () => {
      toast.success('Đã huỷ đơn');
      qc.invalidateQueries({ queryKey: ['myBookings'] });
    },
    onError: (e) => toast.error(e?.message || 'Huỷ thất bại'),
  });

  if (isLoading) return <Loading />;
  const list = data?.data || [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Đơn thuê của tôi</h1>

      {list.length === 0 ? (
        <EmptyState
          title="Bạn chưa có đơn nào"
          action={
            <Link to="/cars" className="btn-primary mt-2">
              Tìm xe để thuê
            </Link>
          }
        />
      ) : (
        <div className="mt-6 space-y-3">
          {list.map((b) => (
            <div key={b.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <img
                src={b.car?.thumbnailUrl || 'https://placehold.co/160x100?text=Car'}
                alt={b.car?.name}
                className="h-24 w-32 rounded-md object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900">{b.car?.name}</p>
                    <p className="text-xs text-gray-500">
                      Mã: <span className="font-mono">{b.bookingCode}</span>
                    </p>
                  </div>
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-medium ${statusColor[b.status]}`}
                  >
                    {b.status}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600 sm:grid-cols-4">
                  <span>Nhận: {formatDateTime(b.pickupAt)}</span>
                  <span>Trả: {formatDateTime(b.returnAt)}</span>
                  <span>{b.totalDays} ngày</span>
                  <span className="font-semibold text-primary-600">
                    {formatCurrency(b.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Link to={`/cars/${b.carId}`} className="btn-outline">
                  Xem xe
                </Link>
                {['DRAFT', 'PENDING_PAYMENT', 'CONFIRMED'].includes(b.status) && (
                  <button
                    onClick={() => cancelMutation.mutate(b.id)}
                    disabled={cancelMutation.isPending}
                    className="btn-outline text-red-600 hover:bg-red-50"
                  >
                    Huỷ
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
