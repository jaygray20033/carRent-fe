// src/pages/admin/corporate/ClientDetailPage.jsx
// B2B Day 7 — contract + price config + settlements summary for one client.
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Building2 } from 'lucide-react';
import { adminCorporateService } from '../../../services/adminService.js';
import { formatCurrency, formatDateTime } from '../../../utils/format.js';
import Loading from '../../../components/common/Loading.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';

const unwrap = (res) => res?.data ?? res ?? {};

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: clientRes, isLoading } = useQuery({
    queryKey: ['adminCorporateClient', id],
    queryFn: () => adminCorporateService.getClient(id),
    enabled: !!id,
  });
  const { data: priceRes } = useQuery({
    queryKey: ['adminCorporatePrice', id],
    queryFn: () => adminCorporateService.getPriceConfig(id),
    enabled: !!id,
  });
  const { data: settlementsRes } = useQuery({
    queryKey: ['adminCorporateSettlements', id],
    queryFn: () => adminCorporateService.listSettlements(id, { size: 20 }),
    enabled: !!id,
  });
  const { data: bookingsRes } = useQuery({
    queryKey: ['adminCorporateBookingsClient', id],
    queryFn: () => adminCorporateService.listBookings({ corporateId: id, size: 20 }),
    enabled: !!id,
  });

  const client = unwrap(clientRes)?.client || unwrap(clientRes);
  const priceConfig = unwrap(priceRes)?.priceConfig || unwrap(priceRes) || client?.priceConfig;
  const settlements = (() => {
    const p = unwrap(settlementsRes);
    return Array.isArray(p) ? p : p.items || [];
  })();
  const bookings = (() => {
    const p = unwrap(bookingsRes);
    return Array.isArray(p) ? p : p.items || [];
  })();

  if (isLoading) return <Loading />;
  if (!client?.id) {
    return <EmptyState title="Không tìm thấy công ty" icon={Building2} />;
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate('/admin/corporate/clients')}
        className="inline-flex items-center gap-2 text-sm text-ink-400 hover:text-ink-700"
      >
        <ArrowLeft className="h-4 w-4" /> Danh sách công ty
      </button>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
        <h1 className="text-xl font-bold text-ink-700">{client.name}</h1>
        <div className="mt-2 grid gap-2 text-sm text-ink-500 sm:grid-cols-2">
          <div>MST: <span className="font-mono text-ink-700">{client.taxCode}</span></div>
          <div>HĐ: {client.contractRef || '—'}</div>
          <div>Liên hệ: {client.contactName || '—'} · {client.contactPhone || ''}</div>
          <div>Email: {client.contactEmail || '—'}</div>
          <div>Credit: {formatCurrency(client.creditLimit || 0)}</div>
          <div>Payment term: {client.paymentTermDays ?? 0} ngày</div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
        <h2 className="mb-3 font-semibold text-ink-700">Bảng giá (priceConfig)</h2>
        <pre className="max-h-64 overflow-auto rounded-xl bg-ink-50 p-3 text-xs text-ink-600">
          {JSON.stringify(priceConfig, null, 2)}
        </pre>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
        <h2 className="mb-3 font-semibold text-ink-700">Chuyến gần đây</h2>
        {bookings.length === 0 ? (
          <p className="text-sm text-ink-300">Chưa có chuyến</p>
        ) : (
          <ul className="divide-y divide-ink-50 text-sm">
            {bookings.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span>
                  #{b.id} · {b.vehicleType} · {b.rentalType}
                </span>
                <span className="text-ink-400">{b.status}</span>
                <span className="font-medium">{formatCurrency(b.finalAmount ?? b.basePrice)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
        <h2 className="mb-3 font-semibold text-ink-700">Settlements</h2>
        {settlements.length === 0 ? (
          <p className="text-sm text-ink-300">Chưa có kỳ quyết toán</p>
        ) : (
          <ul className="divide-y divide-ink-50 text-sm">
            {settlements.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span>
                  #{s.id} · {formatDateTime?.(s.periodStart) || String(s.periodStart).slice(0, 10)}
                  {' → '}
                  {String(s.periodEnd).slice(0, 10)}
                </span>
                <span className="text-ink-400">{s.status}</span>
                <span className="font-medium">{formatCurrency(s.totalAmount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
