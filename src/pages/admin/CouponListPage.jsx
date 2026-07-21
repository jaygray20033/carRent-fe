// src/pages/admin/CouponListPage.jsx
// Admin coupon list (UC-57) — search by code, active filter, table, delete.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminCouponService } from '../../services/adminService.js';
import { formatCurrency, formatDate } from '../../utils/format.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';

const PAGE_SIZE = 20;

const ACTIVE_TABS = [
  { value: '', label: 'Tất cả' },
  { value: 'true', label: 'Đang bật' },
  { value: 'false', label: 'Đã tắt' },
];

const TYPE_LABEL = {
  FIXED: 'Cố định',
  PERCENT: 'Phần trăm',
  FREE_DRIVER: 'Miễn phí tài xế',
};

const APPLIES_LABEL = {
  ALL: 'Tất cả',
  CATEGORY: 'Theo danh mục',
  MODEL: 'Theo dòng xe',
};

// Human-readable discount value by coupon type.
const formatValue = (c) => {
  if (c.type === 'PERCENT') return `${c.value}%`;
  if (c.type === 'FREE_DRIVER') return 'Miễn phí tài xế';
  return formatCurrency(c.value);
};

export default function CouponListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isActive, setIsActive] = useState('');
  const [q, setQ] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['adminCoupons', isActive, searchTerm, page],
    queryFn: () =>
      adminCouponService.list({
        page,
        size: PAGE_SIZE,
        ...(isActive ? { isActive } : {}),
        ...(searchTerm ? { q: searchTerm } : {}),
      }),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminCouponService.remove(id),
    onSuccess: () => {
      toast.success('Đã xóa mã giảm giá');
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
    },
    onError: (e) => toast.error(e?.message || 'Không thể xóa mã giảm giá'),
  });

  const payload = data?.data ?? data ?? {};
  const list = Array.isArray(payload) ? payload : payload.items || [];
  const total = data?.meta?.total ?? payload.total ?? data?.total ?? list.length;
  const totalPages = data?.meta?.totalPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(q.trim());
    setPage(1);
  };

  const handleTab = (value) => {
    setIsActive(value);
    setPage(1);
  };

  const handleDelete = (coupon) => {
    if (window.confirm(`Xóa mã giảm giá "${coupon.code}"?`)) {
      deleteMutation.mutate(coupon.id);
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-ink-700">Quản lý mã giảm giá</h1>
        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => navigate('/admin/coupons/new')}
        >
          Tạo mã mới
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {ACTIVE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTab(tab.value)}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                isActive === tab.value
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
            placeholder="Tìm theo mã…"
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
              title="Chưa có mã giảm giá"
              description="Bắt đầu bằng cách tạo mã mới."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full text-sm ${isFetching ? 'opacity-60' : ''}`}>
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs uppercase text-ink-300">
                  <th className="px-4 py-3 font-medium">Mã</th>
                  <th className="px-4 py-3 font-medium">Loại</th>
                  <th className="px-4 py-3 font-medium">Giá trị</th>
                  <th className="px-4 py-3 font-medium">Áp dụng</th>
                  <th className="px-4 py-3 font-medium">Hiệu lực</th>
                  <th className="px-4 py-3 font-medium">Đã dùng</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-ink-50 last:border-0 hover:bg-ink-50/40"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold text-ink-700">{c.code}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-500">{TYPE_LABEL[c.type] || c.type}</td>
                    <td className="px-4 py-3 font-medium text-ink-700">{formatValue(c)}</td>
                    <td className="px-4 py-3 text-ink-500">
                      {APPLIES_LABEL[c.appliesTo] || c.appliesTo}
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      {formatDate(c.startAt)} – {formatDate(c.endAt)}
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      {c.usageCount ?? 0}
                      {c.maxUse > 0 ? ` / ${c.maxUse}` : ''}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
                          c.isActive
                            ? 'bg-success/10 text-success'
                            : 'bg-ink-100 text-ink-500'
                        }`}
                      >
                        {c.isActive ? 'Đang bật' : 'Đã tắt'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/coupons/${c.id}`)}
                          title="Sửa"
                          className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-50 hover:text-brand-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c)}
                          title="Xóa"
                          className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-danger/5 hover:text-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
