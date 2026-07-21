// src/pages/admin/corporate/SlaViolationsPage.jsx
// ENT — queue báo cáo SLA từ doanh nghiệp, xác nhận vi phạm.
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { adminCorporateService } from '../../../services/adminService.js';
import { formatDateTime } from '../../../utils/format.js';
import Loading from '../../../components/common/Loading.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import Select from '../../../components/ui/Select.jsx';

const unwrap = (res) => res?.data ?? res ?? {};
const listOf = (res) => {
  const p = unwrap(res);
  return Array.isArray(p) ? p : p.items || [];
};

const SEVERITY_BADGE = {
  MINOR: 'bg-ink-100 text-ink-600',
  MAJOR: 'bg-amber-100 text-amber-800',
  CRITICAL: 'bg-red-100 text-red-700',
};

const STATUS_OPTIONS = [
  { value: 'false', label: 'Chờ xác nhận' },
  { value: 'true', label: 'Đã xác nhận' },
  { value: '', label: 'Tất cả' },
];

const SEVERITY_OPTIONS = [
  { value: '', label: 'Mọi mức độ' },
  { value: 'CRITICAL', label: 'CRITICAL' },
  { value: 'MAJOR', label: 'MAJOR' },
  { value: 'MINOR', label: 'MINOR' },
];

export default function SlaViolationsPage() {
  const qc = useQueryClient();
  const [isConfirmed, setIsConfirmed] = useState('false');
  const [severity, setSeverity] = useState('');
  const [selected, setSelected] = useState(null);
  const [resolution, setResolution] = useState('');

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['adminSlaViolations', isConfirmed, severity],
    queryFn: () =>
      adminCorporateService.listSlaViolations({
        ...(isConfirmed !== '' ? { isConfirmed } : {}),
        ...(severity ? { severity } : {}),
        size: 50,
      }),
    refetchInterval: 30_000,
    keepPreviousData: true,
  });

  const list = listOf(data);
  const total = useMemo(() => {
    const p = unwrap(data);
    return p.total ?? list.length;
  }, [data, list.length]);

  const confirmMut = useMutation({
    mutationFn: ({ id, resolution: res }) =>
      adminCorporateService.confirmSlaViolation(id, {
        resolution: res?.trim() || null,
      }),
    onSuccess: () => {
      toast.success('Đã xác nhận vi phạm SLA');
      setSelected(null);
      setResolution('');
      qc.invalidateQueries({ queryKey: ['adminSlaViolations'] });
    },
    onError: (e) => toast.error(e?.message || 'Xác nhận thất bại'),
  });

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-700">Báo cáo SLA từ doanh nghiệp</h1>
          <p className="text-sm text-ink-400">
            Tiếp nhận & xác nhận vi phạm DN gửi về · auto-refresh 30s
            {isFetching ? ' · đang cập nhật…' : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="w-44">
            <Select
              value={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.value)}
              options={STATUS_OPTIONS}
            />
          </div>
          <div className="w-40">
            <Select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              options={SEVERITY_OPTIONS}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <Loading />
      ) : list.length === 0 ? (
        <EmptyState title="Chưa có báo cáo SLA" icon={ShieldAlert} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            <div className="text-xs text-ink-400">{total} báo cáo</div>
            {list.map((v) => {
              const corp = v.booking?.corporate;
              const active = selected?.id === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setSelected(v);
                    setResolution(v.resolution || '');
                  }}
                  className={`w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:ring-2 hover:ring-brand-primary/30 ${
                    active ? 'ring-2 ring-brand-primary/40' : 'ring-1 ring-ink-100'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-ink-700">
                        #{v.id} · {corp?.name || `Corp #${v.booking?.corporateId || '—'}`}
                      </div>
                      <div className="mt-1 text-sm text-ink-500">
                        Chuyến #{v.booking?.id || v.corporateBookingId} ·{' '}
                        {v.sla?.name || `SLA #${v.slaId}`}
                      </div>
                      <div className="mt-1 line-clamp-2 text-sm text-ink-600">{v.description}</div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                          SEVERITY_BADGE[v.severity] || SEVERITY_BADGE.MINOR
                        }`}
                      >
                        {v.severity}
                      </span>
                      <div className="mt-1 text-xs text-ink-400">
                        {v.isConfirmed ? 'Đã xác nhận' : 'Chờ xác nhận'}
                      </div>
                      <div className="text-xs text-ink-300">
                        {formatDateTime?.(v.createdAt) || String(v.createdAt).slice(0, 16)}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
            <h2 className="font-semibold text-ink-700">Chi tiết báo cáo</h2>
            {!selected && (
              <p className="mt-2 text-sm text-ink-400">Chọn một báo cáo để xem / xác nhận</p>
            )}
            {selected && (
              <div className="mt-3 space-y-2 text-sm text-ink-600">
                <div>
                  <strong>#{selected.id}</strong> · {selected.severity}
                </div>
                <div>
                  DN: {selected.booking?.corporate?.name || '—'}
                  {selected.booking?.corporate?.contractTerminationRisk
                    ? ' · ⚠ termination risk'
                    : ''}
                </div>
                <div>
                  Chuyến #{selected.booking?.id} · {selected.booking?.status}
                </div>
                {selected.booking?.pickupAddress && (
                  <div>
                    {selected.booking.pickupAddress} → {selected.booking.dropoffAddress}
                  </div>
                )}
                <div>SLA: {selected.sla?.name || selected.slaId}</div>
                <div className="rounded-lg bg-ink-50 px-3 py-2 text-ink-700">
                  {selected.description}
                </div>
                <div className="text-xs text-ink-400">
                  Báo cáo bởi: {selected.reportedBy} #{selected.reportedById}
                </div>
                {(selected.evidenceUrls || []).length > 0 && (
                  <div>
                    Evidence:
                    <ul className="mt-1 list-disc pl-5">
                      {selected.evidenceUrls.map((u) => (
                        <li key={u}>
                          <a
                            href={u}
                            target="_blank"
                            rel="noreferrer"
                            className="text-brand-primary underline"
                          >
                            {u}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selected.isConfirmed ? (
                  <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-emerald-800">
                    <div className="inline-flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="h-4 w-4" /> Đã xác nhận
                    </div>
                    {selected.resolution && (
                      <div className="mt-1 text-sm">Xử lý: {selected.resolution}</div>
                    )}
                    {selected.resolvedAt && (
                      <div className="mt-1 text-xs">
                        Lúc {formatDateTime?.(selected.resolvedAt) || String(selected.resolvedAt)}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 space-y-2 border-t border-ink-100 pt-3">
                    <label className="block text-sm">
                      Ghi chú xử lý (tuỳ chọn)
                      <textarea
                        className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
                        rows={3}
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        placeholder="VD: Xác nhận chậm 45 phút, áp dụng penalty theo HĐ"
                      />
                    </label>
                    <button
                      type="button"
                      data-testid="confirm-sla-violation"
                      disabled={confirmMut.isPending}
                      className="inline-flex items-center gap-1 rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                      onClick={() =>
                        confirmMut.mutate({ id: selected.id, resolution })
                      }
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {confirmMut.isPending ? 'Đang xác nhận...' : 'Xác nhận vi phạm'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
