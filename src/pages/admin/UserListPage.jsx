// src/pages/admin/UserListPage.jsx
// Admin user management (Day 34 — UC-55). Filterable table by role, status,
// and free-text search (name / phone / email); row click opens the detail page.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Eye, User as UserIcon } from 'lucide-react';
import { adminUserService } from '../../services/adminService.js';
import { formatCurrency, formatDateTime } from '../../utils/format.js';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';

const PAGE_SIZE = 20;
const unwrap = (res) => res?.data ?? res ?? {};
const listOf = (res) => {
  const p = unwrap(res);
  return Array.isArray(p) ? p : p.items || [];
};

const ROLE_OPTIONS = [
  { value: '', label: 'Tất cả vai trò' },
  { value: 'CUSTOMER', label: 'Khách hàng' },
  { value: 'ADMIN', label: 'Quản trị' },
  { value: 'OPERATOR', label: 'Điều hành' },
  { value: 'AGENT', label: 'Nhân viên' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'ACTIVE', label: 'Hoạt động' },
  { value: 'LOCKED', label: 'Đã khóa' },
  { value: 'PENDING', label: 'Chờ kích hoạt' },
];

const STATUS_BADGE = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  LOCKED: 'bg-red-100 text-red-700',
  PENDING: 'bg-amber-100 text-amber-700',
};
const STATUS_LABEL = {
  ACTIVE: 'Hoạt động',
  LOCKED: 'Đã khóa',
  PENDING: 'Chờ kích hoạt',
};

export default function UserListPage() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({ role: '', status: '' });
  const [q, setQ] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['adminUsers', filters, searchTerm, page],
    queryFn: () =>
      adminUserService.list({
        page,
        limit: PAGE_SIZE,
        ...(filters.role ? { role: filters.role } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(searchTerm ? { q: searchTerm } : {}),
      }),
    keepPreviousData: true,
  });

  const list = listOf(data);
  const meta = data?.meta ?? {};
  const total = meta.total ?? list.length;
  const totalPages = meta.totalPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE));

  const setFilter = (key) => (e) => {
    setFilters((f) => ({ ...f, [key]: e.target.value }));
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(q.trim());
    setPage(1);
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-ink-700">Quản lý người dùng</h1>
        <span className="text-sm text-ink-300">{total} người dùng</span>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Select value={filters.role} onChange={setFilter('role')} options={ROLE_OPTIONS} />
        <Select value={filters.status} onChange={setFilter('status')} options={STATUS_OPTIONS} />
        <form onSubmit={handleSearch}>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tên / SĐT / email…"
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
            <EmptyState title="Không có người dùng" description="Thử đổi bộ lọc hoặc từ khóa." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full text-sm ${isFetching ? 'opacity-60' : ''}`}>
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs uppercase text-ink-300">
                  <th className="px-4 py-3 font-medium">Người dùng</th>
                  <th className="px-4 py-3 font-medium">Liên hệ</th>
                  <th className="px-4 py-3 font-medium">Vai trò</th>
                  <th className="px-4 py-3 font-medium">Số dư ví</th>
                  <th className="px-4 py-3 font-medium">Đơn</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium">Ngày tạo</th>
                  <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {list.map((u) => (
                  <tr key={u.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-50">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt={u.fullName} className="h-full w-full object-cover" />
                          ) : (
                            <UserIcon className="h-4 w-4 text-ink-300" />
                          )}
                        </span>
                        <span className="font-medium text-ink-700">{u.fullName || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      <p>{u.phone || '—'}</p>
                      <p className="text-xs text-ink-300">{u.email || ''}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-500">{u.role?.name || u.role?.code || '—'}</td>
                    <td className="px-4 py-3 font-medium text-ink-700">
                      {u.wallet ? formatCurrency(u.wallet.balance) : '—'}
                    </td>
                    <td className="px-4 py-3 text-ink-500">{u._count?.bookings ?? 0}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
                          STATUS_BADGE[u.status] || 'bg-ink-100 text-ink-500'
                        }`}
                      >
                        {STATUS_LABEL[u.status] || u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-500">{formatDateTime(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/users/${u.id}`)}
                          title="Xem chi tiết"
                          className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-50 hover:text-brand-primary"
                        >
                          <Eye className="h-4 w-4" />
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
