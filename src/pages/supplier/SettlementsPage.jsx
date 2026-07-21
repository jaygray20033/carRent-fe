// src/pages/supplier/SettlementsPage.jsx — supplier payout period list.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Wallet } from 'lucide-react';
import {
  supplierPortalService,
  SETTLEMENT_STATUS_LABEL,
  SETTLEMENT_STATUS_BADGE,
} from '../../services/supplierService.js';
import { formatCurrency, formatDate } from '../../utils/format.js';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';

const PAGE_SIZE = 20;
const unwrap = (res) => res?.data ?? res ?? {};
const listOf = (res) => {
  const p = unwrap(res);
  return Array.isArray(p) ? p : p.items || [];
};

export default function SupplierSettlementsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['supplier', 'settlements', page],
    queryFn: () => supplierPortalService.listSettlements({ page, size: PAGE_SIZE }),
    keepPreviousData: true,
  });

  const list = listOf(data);
  const meta = data?.meta ?? {};
  const total = meta.total ?? list.length;
  const totalPages = meta.totalPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-700">Payout / Thanh toán</h1>
          <p className="text-sm text-ink-400">
            Các kỳ OtoRent thanh toán cho bạn (đã trừ hoa hồng). Nộp hoá đơn GTGT + bảng kê + lệnh
            điều xe để được duyệt chi.
          </p>
        </div>
        <span className="text-sm text-ink-300">{total} kỳ</span>
      </div>

      {isLoading ? (
        <Loading />
      ) : list.length === 0 ? (
        <EmptyState title="Chưa có kỳ payout" icon={Wallet} />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink-100">
          <table className="min-w-full text-sm">
            <thead className="bg-ink-50 text-left text-ink-400">
              <tr>
                <th className="px-4 py-3 font-medium">Kỳ</th>
                <th className="px-4 py-3 font-medium">Số chuyến</th>
                <th className="px-4 py-3 font-medium">Thực nhận</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id} className="border-t border-ink-50 hover:bg-ink-50/60">
                  <td className="px-4 py-3">
                    <Link
                      to={`/supplier/settlements/${s.id}`}
                      className="font-semibold text-brand-primary"
                    >
                      {formatDate(s.periodStart)} → {formatDate(s.periodEnd)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{s._count?.bookings ?? '—'}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(s.supplierPayout)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        SETTLEMENT_STATUS_BADGE[s.status] || 'bg-ink-100 text-ink-500'
                      }`}
                    >
                      {SETTLEMENT_STATUS_LABEL[s.status] || s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
