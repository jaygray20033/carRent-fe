// src/pages/user/NotificationsPage.jsx
// UC-51 — full notification centre inside UserLayout. Lists the signed-in
// user's notifications (newest first), lets them mark one / all as read.
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  XCircle,
  Wallet,
  MessageSquare,
  ShieldAlert,
  Tag,
} from 'lucide-react';
import { notificationService } from '../../services/notificationService.js';
import { formatDateTime } from '../../utils/format.js';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';

// Map notification type → icon + accent colour. Falls back to a neutral bell.
const TYPE_META = {
  BOOKING_CONFIRMED: { Icon: CheckCircle2, cls: 'text-green-600 bg-green-50' },
  BOOKING_CANCELLED: { Icon: XCircle, cls: 'text-danger bg-red-50' },
  BOOKING_REFUNDED: { Icon: Wallet, cls: 'text-brand-primary bg-blue-50' },
  COMMENT_APPROVED: { Icon: MessageSquare, cls: 'text-brand-primary bg-blue-50' },
  SOS_RESOLVED: { Icon: ShieldAlert, cls: 'text-amber-500 bg-amber-50' },
  PROMO: { Icon: Tag, cls: 'text-brand-accent bg-orange-50' },
};

const metaFor = (type) => TYPE_META[type] || { Icon: Bell, cls: 'text-ink-500 bg-ink-50' };

function NotificationItem({ n, onRead }) {
  const { Icon, cls } = metaFor(n.type);

  const body = (
    <div
      className={`flex items-start gap-3 rounded-xl p-4 transition-colors ${
        n.isRead ? 'bg-white' : 'bg-brand-primary/[0.04]'
      }`}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${cls}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-ink-900">{n.title}</p>
          {!n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-primary" />}
        </div>
        {n.body && <p className="mt-0.5 text-sm text-ink-600">{n.body}</p>}
        <p className="mt-1 text-xs text-ink-400">{formatDateTime(n.createdAt)}</p>
      </div>
    </div>
  );

  const handleClick = () => {
    if (!n.isRead) onRead(n.id);
  };

  return n.link ? (
    <Link to={n.link} onClick={handleClick} className="block">
      {body}
    </Link>
  ) : (
    <button type="button" onClick={handleClick} className="block w-full text-left">
      {body}
    </button>
  );
}

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const limit = 15;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', page],
    queryFn: () => notificationService.list({ page, limit }),
    placeholderData: keepPreviousData,
  });

  const result = data?.data ?? {};
  const items = result.items ?? [];
  const total = result.total ?? 0;
  const unreadCount = result.unreadCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
  };

  const readOne = useMutation({
    mutationFn: (id) => notificationService.markRead(id),
    onSuccess: invalidate,
  });

  const readAll = useMutation({
    mutationFn: () => notificationService.readAll(),
    onSuccess: invalidate,
  });

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink-100 md:p-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-bold text-ink-900">
          Thông báo
          {unreadCount > 0 && (
            <span className="ml-2 rounded-full bg-brand-primary px-2 py-0.5 text-xs font-semibold text-white">
              {unreadCount} mới
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => readAll.mutate()}
            disabled={readAll.isPending}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:underline disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />
            Đánh dấu đã đọc tất cả
          </button>
        )}
      </div>

      <div className="mt-4">
        {isLoading ? (
          <Loading />
        ) : items.length === 0 ? (
          <EmptyState
            title="Chưa có thông báo"
            description="Các cập nhật về đơn thuê và tài khoản sẽ xuất hiện ở đây."
          />
        ) : (
          <div className="space-y-1.5">
            {items.map((n) => (
              <NotificationItem key={n.id} n={n} onRead={readOne.mutate} />
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          className="mt-6"
        />
      )}
    </div>
  );
}
