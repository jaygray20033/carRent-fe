// src/pages/enterprise/SchedulePage.jsx
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { enterpriseService } from '../../services/enterpriseService.js';
import Loading from '../../components/common/Loading.jsx';
import { formatCurrency, formatDateTime } from '../../utils/format.js';

const STATUS_COLOR = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  IN_PROGRESS: 'bg-sky-100 text-sky-800 border-sky-200',
  PENDING_CONFIRM: 'bg-violet-100 text-violet-800 border-violet-200',
  CONFIRMED: 'bg-ink-100 text-ink-700 border-ink-200',
  SETTLED: 'bg-ink-50 text-ink-500 border-ink-100',
  CANCELLED: 'bg-red-50 text-red-600 border-red-100',
};

export default function EnterpriseSchedulePage() {
  const [view, setView] = useState('list'); // list | calendar
  const [selected, setSelected] = useState(null);
  const [filterVehicle, setFilterVehicle] = useState('');
  const [filterHasVas, setFilterHasVas] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['enterprise', 'bookings'],
    queryFn: () => enterpriseService.listBookings({ size: 100 }),
  });
  const items = useMemo(() => {
    const raw = data?.data ?? data ?? {};
    return Array.isArray(raw) ? raw : raw.items || [];
  }, [data]);

  const filtered = useMemo(() => {
    return items.filter((b) => {
      if (filterVehicle && b.vehicleType !== filterVehicle) return false;
      if (filterHasVas && !(b.bookingVAS?.length || b.bookingVas?.length)) return false;
      return true;
    });
  }, [items, filterVehicle, filterHasVas]);

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-ink-700">Lịch chuyến</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setView('list')}
            className={`rounded-xl px-3 py-1.5 text-sm font-semibold ${
              view === 'list' ? 'bg-brand-primary text-white' : 'bg-ink-100'
            }`}
          >
            List
          </button>
          <button
            type="button"
            onClick={() => setView('calendar')}
            className={`rounded-xl px-3 py-1.5 text-sm font-semibold ${
              view === 'calendar' ? 'bg-brand-primary text-white' : 'bg-ink-100'
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm"
          value={filterVehicle}
          onChange={(e) => setFilterVehicle(e.target.value)}
        >
          <option value="">Mọi loại xe</option>
          <option value="4_5_seat">4-5 chỗ</option>
          <option value="7_seat">7 chỗ</option>
          <option value="16_seat">16 chỗ</option>
          <option value="29_seat">29 chỗ</option>
        </select>
        <label className="inline-flex items-center gap-2 text-sm text-ink-600">
          <input
            type="checkbox"
            checked={filterHasVas}
            onChange={(e) => setFilterHasVas(e.target.checked)}
          />
          Có VAS
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-2">
          {view === 'list' &&
            filtered.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelected(b)}
                className={`w-full rounded-2xl border p-4 text-left shadow-sm transition hover:ring-2 hover:ring-brand-primary/30 ${
                  STATUS_COLOR[b.status] || 'bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold">#{b.id} · {b.vehicleType}</div>
                  <span className="text-xs font-bold">{b.status}</span>
                </div>
                <div className="mt-1 text-sm opacity-80">
                  {formatDateTime(b.pickupAt)} → {formatDateTime(b.returnAt)}
                </div>
                <div className="text-sm opacity-80">
                  {b.pickupAddress} → {b.dropoffAddress}
                </div>
              </button>
            ))}

          {view === 'calendar' && (
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink-100">
              <div className="mb-3 text-sm font-semibold text-ink-600">
                Tháng {dayjs().format('MM/YYYY')}
              </div>
              <div className="space-y-2">
                {filtered.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelected(b)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm ${
                      STATUS_COLOR[b.status] || ''
                    }`}
                  >
                    <span>
                      {dayjs(b.pickupAt).format('DD/MM HH:mm')} · #{b.id}
                    </span>
                    <span className="font-semibold">{b.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="rounded-2xl bg-white p-8 text-center text-sm text-ink-400 ring-1 ring-ink-100">
              Chưa có chuyến nào
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
          <h2 className="font-semibold text-ink-700">Chi tiết</h2>
          {!selected && (
            <p className="mt-2 text-sm text-ink-400">Chọn một chuyến để xem chi tiết</p>
          )}
          {selected && (
            <div className="mt-3 space-y-2 text-sm text-ink-600">
              <div>
                <strong>#{selected.id}</strong> · {selected.status}
              </div>
              <div>{selected.vehicleType} · {selected.rentalType}</div>
              <div>{formatDateTime(selected.pickupAt)}</div>
              <div>
                {selected.pickupAddress} → {selected.dropoffAddress}
              </div>
              <div>Base: {formatCurrency(selected.basePrice || 0)}</div>
              {(selected.bookingVAS || selected.bookingVas || []).length > 0 && (
                <div>
                  VAS:{' '}
                  {(selected.bookingVAS || selected.bookingVas)
                    .map((v) => v.vas?.name || v.name || 'VAS')
                    .join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
