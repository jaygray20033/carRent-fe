// src/pages/user/MyBookingsPage.jsx
// Booking schedule page (Figma: UserAccount-Schedule.png)
// Tabs: Tất cả / Chờ thanh toán / Đã xác nhận / Đang dùng / Hoàn tất / Đã hủy
// List + pagination + click → detail.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock } from 'lucide-react';
import { bookingService } from '../../services/bookingService.js';
import { formatCurrency, formatDateTime } from '../../utils/format.js';
import { BOOKING_TABS, statusColor, statusLabel } from '../../utils/bookingStatus.js';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';

const PAGE_SIZE = 6;

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(null); // null = "Tất cả"
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['myBookings', activeTab, page],
    queryFn: () =>
      bookingService.listMy({
        page,
        limit: PAGE_SIZE,
        ...(activeTab ? { status: activeTab } : {}),
      }),
    keepPreviousData: true,
  });

  // The API client unwraps to the response body. Support a couple of shapes.
  const payload = data?.data ?? data ?? {};
  const list = Array.isArray(payload) ? payload : payload.items || payload.data || [];
  const total = payload.total ?? data?.total ?? list.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleTab = (value) => {
    setActiveTab(value);
    setPage(1);
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-6">
      <h1 className="text-xl font-bold text-gray-900">Lịch đặt xe của tôi</h1>

      {/* Tabs */}
      <div className="mt-4 flex flex-wrap gap-2 border-b border-gray-100 pb-3">
        {BOOKING_TABS.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.label}
              onClick={() => handleTab(tab.value)}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-900 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* List */}
      {isLoading ? (
        <Loading />
      ) : list.length === 0 ? (
        <EmptyState
          title="Không có đơn nào"
          description="Bạn chưa có đơn đặt xe ở trạng thái này."
        />
      ) : (
        <ul className={`mt-4 space-y-3 ${isFetching ? 'opacity-60' : ''}`}>
          {list.map((b) => {
            const car = b.car || b.vehicle || {};
            const carName =
              car.name ||
              [car.brand?.name, car.model?.name].filter(Boolean).join(' ') ||
              'Xe thuê';
            const thumb =
              car.thumbnailUrl ||
              car.images?.[0]?.url ||
              'https://placehold.co/160x100?text=Car';
            return (
              <li
                key={b.id}
                onClick={() => navigate(`/me/bookings/${b.id}`)}
                className="flex cursor-pointer flex-col items-stretch gap-3 rounded-xl border border-gray-100 p-3 transition-colors hover:border-blue-200 hover:bg-blue-50/40 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-900">{carName}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatDateTime(b.pickupAt)}
                  </p>
                </div>

                <img
                  src={thumb}
                  alt={carName}
                  className="h-16 w-28 rounded-lg object-cover"
                />

                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${statusColor(
                      b.status
                    )}`}
                  >
                    {b.status === 'IN_USE' || b.status === 'PENDING_PAYMENT' ? (
                      <Clock className="h-3 w-3" />
                    ) : null}
                    {statusLabel(b.status)}
                  </span>
                  <span className="text-sm font-semibold text-blue-700">
                    {formatCurrency(b.totalAmount ?? b.total_price)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/me/bookings/${b.id}`);
                  }}
                  className="rounded-lg border border-blue-600 px-4 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50"
                >
                  Chi tiết
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
