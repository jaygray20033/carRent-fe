// src/pages/admin/corporate/ClientListPage.jsx
// B2B Day 7 UC-61/72 — list corporate clients with month KPIs.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, Eye, Search } from 'lucide-react';
import { adminCorporateService } from '../../../services/adminService.js';
import { formatCurrency } from '../../../utils/format.js';
import Input from '../../../components/ui/Input.jsx';
import Loading from '../../../components/common/Loading.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import Pagination from '../../../components/ui/Pagination.jsx';

const PAGE_SIZE = 20;
const unwrap = (res) => res?.data ?? res ?? {};
const listOf = (res) => {
  const p = unwrap(res);
  return Array.isArray(p) ? p : p.items || [];
};

const CONTRACT_BADGE = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  EXPIRED: 'bg-red-100 text-red-700',
  INACTIVE: 'bg-ink-100 text-ink-500',
};

export default function ClientListPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['adminCorporateClients', searchTerm, page],
    queryFn: () =>
      adminCorporateService.listClients({
        page,
        size: PAGE_SIZE,
        ...(searchTerm ? { q: searchTerm } : {}),
      }),
    keepPreviousData: true,
  });

  const list = listOf(data);
  const meta = data?.meta ?? {};
  const total = meta.total ?? list.length;
  const totalPages = meta.totalPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-700">Doanh nghiệp</h1>
          <p className="text-sm text-ink-400">Corporate clients B2B + KPI tháng này</p>
        </div>
        <span className="text-sm text-ink-300">{total} công ty</span>
      </div>

      <form
        className="mb-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSearchTerm(q.trim());
          setPage(1);
        }}
      >
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm tên / MST / hợp đồng…"
          leftIcon={<Search className="h-4 w-4" />}
        />
      </form>

      {isLoading ? (
        <Loading />
      ) : list.length === 0 ? (
        <EmptyState title="Chưa có corporate client" icon={Building2} />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink-100">
          <table className="min-w-full text-sm">
            <thead className="bg-ink-50 text-left text-ink-400">
              <tr>
                <th className="px-4 py-3 font-medium">Công ty</th>
                <th className="px-4 py-3 font-medium">MST</th>
                <th className="px-4 py-3 font-medium">HĐ</th>
                <th className="px-4 py-3 font-medium">Chuyến tháng</th>
                <th className="px-4 py-3 font-medium">DT tháng</th>
                <th className="px-4 py-3 font-medium">Nợ QT</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr
                  key={c.id}
                  className="cursor-pointer border-t border-ink-50 hover:bg-ink-50/60"
                  onClick={() => navigate(`/admin/corporate/clients/${c.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-ink-700">{c.name}</div>
                    <div className="text-xs text-ink-300">{c.contactName || '—'}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{c.taxCode}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        CONTRACT_BADGE[c.contractStatus] || CONTRACT_BADGE.ACTIVE
                      }`}
                    >
                      {c.contractStatus || (c.isActive ? 'ACTIVE' : 'INACTIVE')}
                    </span>
                  </td>
                  <td className="px-4 py-3">{c.totalTripsThisMonth ?? 0}</td>
                  <td className="px-4 py-3">{formatCurrency(c.totalRevenue ?? 0)}</td>
                  <td className="px-4 py-3 text-amber-700">
                    {formatCurrency(c.pendingSettlement ?? 0)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Eye className="inline h-4 w-4 text-ink-300" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
