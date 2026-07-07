// src/pages/admin/ContactMessageListPage.jsx
// Admin contact message queue (Day 36 — UC-29). Filter by status, view detail,
// mark READ / save reply note. ADMIN/OPERATOR only.
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Phone, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminContactService } from '../../services/contactService.js';
import { formatDateTime } from '../../utils/format.js';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';

const PAGE_SIZE = 20;

const STATUS_TABS = [
  { value: '', label: 'Tất cả' },
  { value: 'NEW', label: 'Mới' },
  { value: 'READ', label: 'Đã đọc' },
  { value: 'REPLIED', label: 'Đã phản hồi' },
];

const STATUS_META = {
  NEW: { label: 'Mới', variant: 'warning' },
  READ: { label: 'Đã đọc', variant: 'info' },
  REPLIED: { label: 'Đã phản hồi', variant: 'success' },
};

export default function ContactMessageListPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [replyNote, setReplyNote] = useState('');

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['adminContacts', status, page],
    queryFn: () =>
      adminContactService.list({
        page,
        size: PAGE_SIZE,
        ...(status ? { status } : {}),
      }),
    keepPreviousData: true,
  });

  const payload = data?.data ?? data ?? {};
  const list = Array.isArray(payload) ? payload : payload.items || [];
  // paginated() puts the count in `meta`; fall back to legacy shapes then page length.
  const total = data?.meta?.total ?? payload.total ?? data?.total ?? list.length;
  const totalPages = data?.meta?.totalPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE));

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }) => adminContactService.update(id, body),
    onSuccess: () => {
      toast.success('Đã cập nhật liên hệ');
      queryClient.invalidateQueries({ queryKey: ['adminContacts'] });
    },
    onError: (e) => toast.error(e?.message || 'Cập nhật thất bại'),
  });

  const handleTab = (value) => {
    setStatus(value);
    setPage(1);
  };

  // Open detail; auto-mark NEW → READ so the queue reflects it's been seen.
  const openDetail = (msg) => {
    setSelected(msg);
    setReplyNote(msg.replyNote || '');
    if (msg.status === 'NEW') {
      updateMutation.mutate({ id: msg.id, status: 'READ' });
    }
  };

  const closeDetail = () => {
    setSelected(null);
    setReplyNote('');
  };

  const handleReply = () => {
    if (!selected) return;
    updateMutation.mutate(
      { id: selected.id, status: 'REPLIED', replyNote: replyNote.trim() },
      { onSuccess: closeDetail }
    );
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-ink-700">Tin nhắn liên hệ</h1>
      </div>

      {/* Status filter */}
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

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink-100">
        {isLoading ? (
          <div className="p-8">
            <Loading />
          </div>
        ) : list.length === 0 ? (
          <div className="p-8">
            <EmptyState title="Chưa có tin nhắn" description="Chưa có liên hệ nào phù hợp." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full text-sm ${isFetching ? 'opacity-60' : ''}`}>
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs uppercase text-ink-300">
                  <th className="px-4 py-3 font-medium">Người gửi</th>
                  <th className="px-4 py-3 font-medium">Tiêu đề</th>
                  <th className="px-4 py-3 font-medium">Nhận lúc</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {list.map((m) => {
                  const meta = STATUS_META[m.status] || STATUS_META.NEW;
                  return (
                    <tr
                      key={m.id}
                      className="border-b border-ink-50 last:border-0 hover:bg-ink-50/40"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink-700">{m.name}</p>
                        <p className="text-xs text-ink-400">{m.email}</p>
                      </td>
                      <td className="max-w-xs px-4 py-3 text-ink-500">
                        <p className="truncate">{m.subject || '(Không có tiêu đề)'}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-ink-500">
                        {formatDateTime(m.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => openDetail(m)}
                            title="Xem chi tiết"
                            className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-50 hover:text-brand-primary"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Detail + reply modal */}
      <Modal
        open={!!selected}
        onClose={closeDetail}
        title="Chi tiết liên hệ"
        size="lg"
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <span className="font-semibold text-ink-900">{selected.name}</span>
              <a
                href={`mailto:${selected.email}`}
                className="inline-flex items-center gap-1.5 text-ink-500 hover:text-brand-primary"
              >
                <Mail className="h-4 w-4" />
                {selected.email}
              </a>
              {selected.phone && (
                <a
                  href={`tel:${selected.phone}`}
                  className="inline-flex items-center gap-1.5 text-ink-500 hover:text-brand-primary"
                >
                  <Phone className="h-4 w-4" />
                  {selected.phone}
                </a>
              )}
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-ink-400">Tiêu đề</p>
              <p className="text-sm text-ink-700">{selected.subject || '(Không có tiêu đề)'}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-ink-400">Nội dung</p>
              <p className="mt-1 whitespace-pre-line rounded-xl bg-ink-50 p-3 text-sm text-ink-700">
                {selected.message}
              </p>
            </div>

            <div>
              <label
                htmlFor="replyNote"
                className="mb-1.5 block text-xs font-medium uppercase text-ink-400"
              >
                Ghi chú phản hồi
              </label>
              <textarea
                id="replyNote"
                rows={4}
                value={replyNote}
                onChange={(e) => setReplyNote(e.target.value)}
                placeholder="Ghi lại nội dung đã phản hồi khách hàng…"
                className="input"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={closeDetail}>
                Đóng
              </Button>
              <Button
                variant="primary"
                loading={updateMutation.isPending}
                onClick={handleReply}
              >
                Lưu &amp; đánh dấu đã phản hồi
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
