// src/pages/user/ReviewsPage.jsx
// UC-50 — "Đánh giá của tôi" (Figma: UserAccount-Rating.png). Inside UserLayout.
// Tabs: Tất cả / Đã được duyệt / Đang chờ duyệt over the user's own reviews,
// plus COMPLETED bookings not yet reviewed with a "write review" CTA.
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, CheckCircle2, Clock, PenLine } from 'lucide-react';
import { reviewService } from '../../services/reviewService.js';
import { formatDate } from '../../utils/format.js';
import Loading from '../../components/common/Loading.jsx';
import Rating from '../../components/ui/Rating.jsx';
import ReviewFormModal from './ReviewFormModal.jsx';

const TABS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'APPROVED', label: 'Đã được duyệt' },
  { value: 'PENDING', label: 'Đang chờ duyệt' },
];

const STATUS_META = {
  APPROVED: { label: 'Đã duyệt', cls: 'text-green-600', Icon: CheckCircle2 },
  PENDING: { label: 'Đang chờ duyệt', cls: 'text-amber-500', Icon: Clock },
  REJECTED: { label: 'Bị từ chối', cls: 'text-danger', Icon: Clock },
};

function ReviewRow({ review }) {
  const meta = STATUS_META[review.status] || STATUS_META.PENDING;
  const { Icon } = meta;
  return (
    <div className="flex items-start justify-between gap-4 border-b border-ink-100 py-4 last:border-0">
      <div className="flex min-w-0 items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${meta.cls}`} />
        <div className="min-w-0">
          <p className="text-sm text-ink-800">{review.content || 'Không có nội dung.'}</p>
          <div className="mt-1 flex items-center gap-2">
            <Rating value={review.rating} size="sm" />
            <span className={`text-xs ${meta.cls}`}>{meta.label}</span>
            {review.booking?.vehicle?.name && (
              <span className="truncate text-xs text-ink-400">
                · {review.booking.vehicle.name}
              </span>
            )}
          </div>
        </div>
      </div>
      <span className="shrink-0 text-xs text-ink-400">{formatDate(review.createdAt)}</span>
    </div>
  );
}

function ReviewableRow({ booking, onWrite }) {
  const car = booking.vehicle || {};
  return (
    <div className="flex items-center justify-between gap-4 border-b border-ink-100 py-4 last:border-0">
      <div className="flex min-w-0 items-center gap-3">
        {car.thumbnailUrl ? (
          <img
            src={car.thumbnailUrl}
            alt={car.name}
            className="h-14 w-20 shrink-0 rounded-lg object-cover ring-1 ring-ink-100"
          />
        ) : (
          <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-300">
            <Star className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-medium text-ink-900">{car.name || 'Xe đã thuê'}</p>
          <p className="text-xs text-ink-400">
            {formatDate(booking.pickupAt)} - {formatDate(booking.returnAt)}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onWrite(booking)}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-brand-primary px-3.5 py-1.5 text-sm font-medium text-brand-primary transition-colors hover:bg-brand-primary/10"
      >
        <PenLine className="h-4 w-4" />
        Viết đánh giá
      </button>
    </div>
  );
}

export default function ReviewsPage() {
  const [tab, setTab] = useState('ALL');
  const [writing, setWriting] = useState(null); // booking being reviewed

  const { data: mineData, isLoading: mineLoading } = useQuery({
    queryKey: ['my-reviews'],
    queryFn: () => reviewService.listMine({ limit: 50 }),
  });

  const { data: reviewableData, isLoading: reviewableLoading } = useQuery({
    queryKey: ['reviewable-bookings'],
    queryFn: () => reviewService.reviewable(),
  });

  const reviews = mineData?.data ?? [];
  const reviewable = reviewableData?.data?.bookings ?? [];

  const filtered = tab === 'ALL' ? reviews : reviews.filter((r) => r.status === tab);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink-100 md:p-8">
      <h1 className="text-lg font-bold text-ink-900">Đánh giá của tôi</h1>

      {/* Tabs */}
      <div className="mt-4 flex flex-wrap gap-2 border-b border-ink-100 pb-4">
        {TABS.map((t) => {
          const active = tab === t.value;
          return (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/30'
                  : 'text-ink-500 hover:bg-ink-50'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Reviewable bookings — CTA to write a review */}
      {!reviewableLoading && reviewable.length > 0 && (
        <div className="mt-2">
          <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-ink-300">
            Chờ bạn đánh giá
          </p>
          {reviewable.map((b) => (
            <ReviewableRow key={b.id} booking={b} onWrite={setWriting} />
          ))}
        </div>
      )}

      {/* Written reviews */}
      <div className="mt-2">
        {reviewable.length > 0 && (
          <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-ink-300">
            Đánh giá đã viết
          </p>
        )}
        {mineLoading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <div className="py-14 text-center">
            <Star className="mx-auto mb-3 h-10 w-10 text-ink-200" />
            <p className="text-sm text-ink-500">
              {reviews.length === 0
                ? 'Bạn chưa viết đánh giá nào.'
                : 'Không có đánh giá nào ở trạng thái này.'}
            </p>
          </div>
        ) : (
          filtered.map((r) => <ReviewRow key={r.id} review={r} />)
        )}
      </div>

      <ReviewFormModal key={writing?.id ?? 'none'} booking={writing} onClose={() => setWriting(null)} />
    </div>
  );
}
