// src/pages/enterprise/SettlementsPage.jsx
import { useQuery } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { enterpriseService } from '../../services/enterpriseService.js';
import Loading from '../../components/common/Loading.jsx';
import { formatCurrency, formatDateTime } from '../../utils/format.js';

export default function EnterpriseSettlementsPage() {
  const { isAdmin } = useOutletContext() || {};
  const { data, isLoading } = useQuery({
    queryKey: ['enterprise', 'settlements'],
    queryFn: () => enterpriseService.listSettlements({ size: 50 }),
    enabled: Boolean(isAdmin),
  });

  if (!isAdmin) {
    return (
      <div className="rounded-2xl bg-white p-6 text-sm text-ink-500 shadow-sm ring-1 ring-ink-100">
        Chỉ Corporate Admin xem quyết toán.
      </div>
    );
  }
  if (isLoading) return <Loading />;
  const raw = data?.data ?? data ?? {};
  const items = Array.isArray(raw) ? raw : raw.items || [];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-ink-700">Quyết toán</h1>
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink-100">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-ink-50 text-ink-500">
            <tr>
              <th className="px-4 py-3">Kỳ</th>
              <th className="px-4 py-3">Tổng</th>
              <th className="px-4 py-3">VAT</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id} className="border-t border-ink-50">
                <td className="px-4 py-3">
                  {formatDateTime(s.periodStart)} → {formatDateTime(s.periodEnd)}
                </td>
                <td className="px-4 py-3 font-semibold">
                  {formatCurrency(s.totalAmount || 0)}
                </td>
                <td className="px-4 py-3">{formatCurrency(s.totalVat || 0)}</td>
                <td className="px-4 py-3">{s.status}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink-400">
                  Chưa có kỳ quyết toán
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
