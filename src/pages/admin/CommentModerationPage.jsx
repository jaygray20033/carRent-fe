// src/pages/admin/CommentModerationPage.jsx
// Admin comment moderation (UC-24) — status tabs, approve/reject queue.
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminCommentService } from '../../services/adminService.js';
import { formatDateTime } from '../../utils/format.js';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';

const PAGE_SIZE = 20;

const STATUS_TABS = [
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Đã từ chối' },
];

const STATUS_BADGE = {
  PENDING: 'bg-warning/10 text-warning',
  APPROVED: 'bg-success/10 text-success',
  REJECTED: 'bg-danger/10 text-danger',
};

const STATUS_LABEL = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Đã từ chối',
};

const unwrap = (res) => res?.data ?? res ?? {};

export default function CommentModerationPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('PENDING');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['adminComments', status, page],
    queryFn: () => adminCommentService.list({ status, page, size: PAGE_SIZE }),
    keepPreviousData: true,
  });

  const moderateMutation = useMutation({
    mutationFn: ({ id, nextStatus }) => adminCommentService.moderate(id, nextStatus),
    onSuccess: (_res, { nextStatus }) => {
      toast.success(nextStatus === 'APPROVED' ? 'Đã duyệt bình luận' : 'Đã từ chối bình luận');
      queryClient.invalidateQueries({ queryKey: ['adminComments'] });
    },
    onError: (e) => toast.error(e?.message || 'Không thể cập nhật bình luận'),
  });

  const payload = unwrap(data);
  const list = payload.items ?? [];
  const total = data?.meta?.total ?? payload.total ?? list.length;
  const totalPages = data?.meta?.totalPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleTab = (value) => {
    setStatus(value);
    setPage(1);
  };

  const moderate = (id, nextStatus) => moderateMutation.mutate({ id, nextStatus });

  return (
    <div>
      <h1 className="mb-5 text-xl font-bold text-ink-700">Duyệt bình luận</h1>

      {/* Status tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTab(tab.value)}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
              status === tab.value
                ? 'bg-brand-primary text-white'
                : 'bg-white text-ink-500 ring-1 ring-ink-100 hover:bg-ink-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-ink-100">
          <Loading />
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-ink-100">
          <EmptyState
            title="Không có bình luận"
            description="Không có bình luận nào ở trạng thái này."
          />
        </div>
      ) : (
        <ul className={`space-y-3 ${isFetching ? 'opacity-60' : ''}`}>
          {list.map((c) => (
            <li
              key={c.id}
              className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink-100"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink-700">
                      {c.user?.fullName || 'Người dùng'}
                    </span>
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
                        STATUS_BADGE[c.status] || 'bg-ink-100 text-ink-500'
                      }`}
                    >
                      {STATUS_LABEL[c.status] || c.status}
                    </span>
                    <span className="text-xs text-ink-300">
                      {formatDateTime(c.createdAt)}
                    </span>
                  </div>

                  {/* Comment body — rendered as a text node (auto-escaped). */}
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm text-ink-600">
                    {c.content}
                  </p>

                  {c.post && (
                    <a
                      href={`/magazine/${c.post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs text-brand-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {c.post.title}
                    </a>
                  )}
                </div>

                {/* Actions */}
                <div className="flex shrink-0 gap-2">
                  {c.status !== 'APPROVED' && (
                    <button
                      type="button"
                      onClick={() => moderate(c.id, 'APPROVED')}
                      disabled={moderateMutation.isPending}
                      title="Duyệt"
                      className="inline-flex items-center gap-1 rounded-lg bg-success/10 px-3 py-1.5 text-sm font-medium text-success transition-colors hover:bg-success/20 disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      Duyệt
                    </button>
                  )}
                  {c.status !== 'REJECTED' && (
                    <button
                      type="button"
                      onClick={() => moderate(c.id, 'REJECTED')}
                      disabled={moderateMutation.isPending}
                      title="Từ chối"
                      className="inline-flex items-center gap-1 rounded-lg bg-danger/10 px-3 py-1.5 text-sm font-medium text-danger transition-colors hover:bg-danger/20 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      Từ chối
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
