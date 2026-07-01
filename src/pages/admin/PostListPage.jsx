// src/pages/admin/PostListPage.jsx
// Admin blog list (UC-56) — status filter, search, table, soft-delete (archive).
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Archive, Search, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminPostService } from '../../services/adminService.js';
import { formatDate } from '../../utils/format.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';

const PAGE_SIZE = 20;

const STATUS_TABS = [
  { value: '', label: 'Tất cả' },
  { value: 'PUBLISHED', label: 'Đã đăng' },
  { value: 'DRAFT', label: 'Bản nháp' },
  { value: 'ARCHIVED', label: 'Lưu trữ' },
];

const STATUS_BADGE = {
  PUBLISHED: 'bg-success/10 text-success',
  DRAFT: 'bg-warning/10 text-warning',
  ARCHIVED: 'bg-ink-100 text-ink-500',
};

const STATUS_LABEL = {
  PUBLISHED: 'Đã đăng',
  DRAFT: 'Bản nháp',
  ARCHIVED: 'Lưu trữ',
};

export default function PostListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['adminPosts', status, searchTerm, page],
    queryFn: () =>
      adminPostService.list({
        page,
        size: PAGE_SIZE,
        ...(status ? { status } : {}),
        ...(searchTerm ? { q: searchTerm } : {}),
      }),
    keepPreviousData: true,
  });

  const archiveMutation = useMutation({
    mutationFn: (id) => adminPostService.remove(id),
    onSuccess: () => {
      toast.success('Đã lưu trữ bài viết');
      queryClient.invalidateQueries({ queryKey: ['adminPosts'] });
    },
    onError: (e) => toast.error(e?.message || 'Không thể lưu trữ bài viết'),
  });

  const payload = data?.data ?? data ?? {};
  const list = Array.isArray(payload) ? payload : payload.items || [];
  const total = payload.total ?? data?.total ?? list.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(q.trim());
    setPage(1);
  };

  const handleTab = (value) => {
    setStatus(value);
    setPage(1);
  };

  const handleArchive = (post) => {
    if (window.confirm(`Lưu trữ bài viết "${post.title}"?`)) {
      archiveMutation.mutate(post.id);
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-ink-700">Quản lý bài viết</h1>
        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => navigate('/admin/posts/new')}
        >
          Viết bài mới
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
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

        <form onSubmit={handleSearch} className="w-full sm:w-72">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo tiêu đề hoặc slug…"
            leftIcon={<Search className="h-4 w-4" />}
          />
        </form>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink-100">
        {isLoading ? (
          <div className="p-8">
            <Loading />
          </div>
        ) : list.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="Chưa có bài viết"
              description="Bắt đầu bằng cách viết bài mới."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full text-sm ${isFetching ? 'opacity-60' : ''}`}>
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs uppercase text-ink-300">
                  <th className="px-4 py-3 font-medium">Tiêu đề</th>
                  <th className="px-4 py-3 font-medium">Danh mục</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium">Ngày đăng</th>
                  <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {list.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b border-ink-50 last:border-0 hover:bg-ink-50/40"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {post.isFeatured && (
                          <Star className="h-3.5 w-3.5 shrink-0 fill-brand-accent text-brand-accent" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink-700">{post.title}</p>
                          <p className="truncate text-xs text-ink-300">/{post.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      {post.category?.name || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
                          STATUS_BADGE[post.status] || 'bg-ink-100 text-ink-500'
                        }`}
                      >
                        {STATUS_LABEL[post.status] || post.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      {post.publishedAt ? formatDate(post.publishedAt) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/posts/${post.id}`)}
                          title="Sửa"
                          className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-50 hover:text-brand-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {post.status !== 'ARCHIVED' && (
                          <button
                            type="button"
                            onClick={() => handleArchive(post)}
                            title="Lưu trữ"
                            className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-danger/5 hover:text-danger"
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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
    </div>
  );
}
