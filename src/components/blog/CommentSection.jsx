// src/components/blog/CommentSection.jsx
// Blog comments (UC-24). Shows the public APPROVED thread plus the caller's own
// pending/rejected comments (badged), and a form to post a new one. Guests are
// nudged into the global auth modal instead of the form.
import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { MessageCircle, Clock, Check, X } from 'lucide-react';
import { postService } from '../../services/postService.js';
import { useAuthStore } from '../../store/authStore.js';
import { useUiStore } from '../../store/uiStore.js';
import { formatDateTime } from '../../utils/format.js';
import Avatar from '../ui/Avatar.jsx';
import Pagination from '../ui/Pagination.jsx';
import EmptyState from '../common/EmptyState.jsx';

const PER_PAGE = 10;
const MAX_LEN = 2000;

const STATUS_BADGE = {
  PENDING: { label: 'Đang chờ duyệt', className: 'bg-warning/10 text-warning', Icon: Clock },
  REJECTED: { label: 'Đã bị từ chối', className: 'bg-danger/10 text-danger', Icon: X },
  APPROVED: { label: 'Đã duyệt', className: 'bg-success/10 text-success', Icon: Check },
};

function CommentItem({ comment, showStatus }) {
  const badge = showStatus ? STATUS_BADGE[comment.status] : null;
  return (
    <div className="flex gap-3">
      <Avatar src={comment.user?.avatarUrl} name={comment.user?.fullName} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-ink-900">
            {comment.user?.fullName || 'Người dùng'}
          </span>
          <span className="text-xs text-ink-400">{formatDateTime(comment.createdAt)}</span>
          {badge && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
            >
              <badge.Icon className="h-3 w-3" />
              {badge.label}
            </span>
          )}
        </div>
        <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink-700">
          {comment.content}
        </p>
      </div>
    </div>
  );
}

export default function CommentSection({ postId }) {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const openAuthModal = useUiStore((s) => s.openAuthModal);
  const [page, setPage] = useState(1);
  const [content, setContent] = useState('');

  // Public APPROVED thread (paginated).
  const { data, isLoading, isError } = useQuery({
    queryKey: ['comments', postId, page],
    queryFn: () => postService.comments(postId, { page, size: PER_PAGE }),
    enabled: Boolean(postId),
  });

  // The caller's own comments (any status) so we can surface pending/rejected
  // ones that aren't in the public thread yet.
  const { data: mineData } = useQuery({
    queryKey: ['comments-mine', postId],
    queryFn: () => postService.myComments(postId),
    enabled: Boolean(postId) && Boolean(user),
  });

  const approved = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  // On page 1, show the caller's own not-yet-approved comments at the top so
  // they get immediate feedback ("Đang chờ duyệt") right after posting.
  const pendingMine = useMemo(() => {
    if (page !== 1) return [];
    const mine = mineData?.data?.items ?? [];
    return mine.filter((c) => c.status !== 'APPROVED');
  }, [mineData, page]);

  const addMutation = useMutation({
    mutationFn: (text) => postService.addComment(postId, text),
    onSuccess: () => {
      toast.success('Bình luận đã được gửi và đang chờ duyệt');
      setContent('');
      qc.invalidateQueries({ queryKey: ['comments-mine', postId] });
    },
    onError: (e) => toast.error(e?.message || 'Gửi bình luận thất bại'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;
    addMutation.mutate(text);
  };

  return (
    <section className="mt-12 border-t border-ink-100 pt-8">
      <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-ink-900">
        <MessageCircle className="h-5 w-5 text-brand-primary" />
        Bình luận
        {total > 0 && <span className="text-ink-400">({total})</span>}
      </h2>

      {/* Compose */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-3">
            <Avatar src={user.avatarUrl} name={user.fullName} size="sm" />
            <div className="min-w-0 flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, MAX_LEN))}
                rows={3}
                placeholder="Viết bình luận của bạn..."
                className="input resize-y"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-ink-400">
                  {content.length}/{MAX_LEN}
                </span>
                <button
                  type="submit"
                  disabled={!content.trim() || addMutation.isPending}
                  className="btn btn-primary btn-sm"
                >
                  {addMutation.isPending ? 'Đang gửi...' : 'Gửi bình luận'}
                </button>
              </div>
              <p className="mt-2 text-xs text-ink-400">
                Bình luận sẽ hiển thị công khai sau khi được quản trị viên duyệt.
              </p>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 rounded-xl bg-ink-50 p-5 text-center ring-1 ring-ink-100">
          <p className="text-sm text-ink-600">
            Vui lòng đăng nhập để tham gia bình luận.
          </p>
          <button onClick={() => openAuthModal('login')} className="btn btn-primary btn-sm mt-3">
            Đăng nhập
          </button>
        </div>
      )}

      {/* Caller's own pending/rejected comments (page 1 only) */}
      {pendingMine.length > 0 && (
        <div className="mb-6 space-y-4 rounded-xl bg-ink-50/60 p-4 ring-1 ring-ink-100">
          {pendingMine.map((c) => (
            <CommentItem key={`mine-${c.id}`} comment={c} showStatus />
          ))}
        </div>
      )}

      {/* Public approved thread */}
      {isError ? (
        <EmptyState title="Không tải được bình luận" description="Vui lòng thử lại sau." />
      ) : isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex animate-pulse gap-3">
              <div className="h-8 w-8 shrink-0 rounded-full bg-ink-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/4 rounded bg-ink-100" />
                <div className="h-3 w-3/4 rounded bg-ink-100" />
              </div>
            </div>
          ))}
        </div>
      ) : approved.length === 0 && pendingMine.length === 0 ? (
        <EmptyState
          title="Chưa có bình luận"
          description="Hãy là người đầu tiên chia sẻ ý kiến của bạn."
        />
      ) : (
        <div className="space-y-6">
          {approved.map((c) => (
            <CommentItem key={c.id} comment={c} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </section>
  );
}
