// src/pages/enterprise/QualityPage.jsx
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { enterpriseService } from '../../services/enterpriseService.js';
import SLABanner from '../../components/enterprise/SLABanner.jsx';
import Loading from '../../components/common/Loading.jsx';

export default function EnterpriseQualityPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    bookingId: '',
    slaId: '',
    description: '',
    severity: 'MINOR',
  });

  const { data: bookingsRes, isLoading: loadingBookings } = useQuery({
    queryKey: ['enterprise', 'bookings', 'quality'],
    queryFn: () => enterpriseService.listBookings({ size: 50 }),
  });
  const bookings = useMemo(() => {
    const raw = bookingsRes?.data ?? bookingsRes ?? {};
    return Array.isArray(raw) ? raw : raw.items || [];
  }, [bookingsRes]);

  const reportable = bookings.filter((b) =>
    ['IN_PROGRESS', 'PENDING_CONFIRM', 'CONFIRMED'].includes(b.status)
  );

  // ENT-Day 5 — company SLA catalog for dropdown
  const { data: slaRes } = useQuery({
    queryKey: ['enterprise', 'mySla'],
    queryFn: () => enterpriseService.mySla(),
  });
  const slaPayload = slaRes?.data ?? slaRes ?? {};
  const slaItems = slaPayload.items || [];

  // Pull violations for selected booking
  const { data: violRes, isLoading: loadingViol } = useQuery({
    queryKey: ['enterprise', 'violations', form.bookingId],
    queryFn: () => enterpriseService.listBookingViolations(form.bookingId),
    enabled: Boolean(form.bookingId),
  });
  const violations = (violRes?.data ?? violRes)?.items || [];

  const reportMut = useMutation({
    mutationFn: () =>
      enterpriseService.reportViolation(form.bookingId, {
        slaId: Number(form.slaId),
        description: form.description,
        severity: form.severity,
      }),
    onSuccess: () => {
      toast.success('Đã gửi báo cáo vi phạm — chờ OtoRent xác nhận');
      setForm((f) => ({ ...f, description: '' }));
      qc.invalidateQueries({ queryKey: ['enterprise', 'violations', form.bookingId] });
      qc.invalidateQueries({ queryKey: ['enterprise', 'mySla'] });
    },
    onError: (err) => toast.error(err?.message || 'Không gửi được báo cáo'),
  });

  const criticalCount =
    slaPayload.criticalCount ??
    violations.filter((v) => v.severity === 'CRITICAL' && v.isConfirmed).length;
  const warning =
    slaPayload.warningMessage ||
    (criticalCount >= 2
      ? 'Đủ điều kiện chấm dứt HĐ (CRITICAL ≥ 2)'
      : criticalCount === 1
        ? 'Cảnh báo: 1 vi phạm nghiêm trọng'
        : null);

  if (loadingBookings) return <Loading />;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-ink-700">Tiêu chuẩn chất lượng (SLA)</h1>

      <SLABanner
        contractTerminationRisk={criticalCount >= 2}
        warningMessage={warning}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100 space-y-3">
          <h2 className="font-semibold text-ink-700">Báo cáo vi phạm</h2>
          <label className="block text-sm">
            Chuyến
            <select
              className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2"
              value={form.bookingId}
              onChange={(e) => setForm({ ...form, bookingId: e.target.value })}
            >
              <option value="">— Chọn chuyến —</option>
              {reportable.map((b) => (
                <option key={b.id} value={b.id}>
                  #{b.id} · {b.status} · {b.pickupAddress}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Tiêu chuẩn SLA
            <select
              className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2"
              value={form.slaId}
              onChange={(e) => setForm({ ...form, slaId: e.target.value })}
            >
              <option value="">— Chọn SLA —</option>
              {slaItems.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.targetValue ? ` (${s.targetValue})` : ''}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Mức độ
            <select
              className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2"
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
            >
              <option value="MINOR">MINOR</option>
              <option value="MAJOR">MAJOR</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </label>
          <label className="block text-sm">
            Mô tả
            <textarea
              className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Tài xế đến trễ 20 phút..."
            />
          </label>
          <button
            type="button"
            disabled={reportMut.isPending}
            className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            onClick={() => {
              if (!form.bookingId || !form.slaId || !form.description) {
                toast.error('Điền đủ chuyến / SLA / mô tả');
                return;
              }
              reportMut.mutate();
            }}
          >
            Gửi báo cáo
          </button>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
          <h2 className="font-semibold text-ink-700">Vi phạm của chuyến</h2>
          {!form.bookingId && (
            <p className="mt-2 text-sm text-ink-400">Chọn chuyến để xem danh sách</p>
          )}
          {form.bookingId && loadingViol && <Loading />}
          {form.bookingId && !loadingViol && (
            <ul className="mt-3 space-y-2">
              {violations.length === 0 && (
                <li className="text-sm text-ink-400">Chưa có vi phạm</li>
              )}
              {violations.map((v) => (
                <li
                  key={v.id}
                  className="rounded-xl border border-ink-100 px-3 py-2 text-sm"
                >
                  <div className="flex justify-between gap-2">
                    <span className="font-semibold">{v.sla?.name || v.slaId}</span>
                    <span
                      className={
                        v.isConfirmed ? 'text-emerald-600' : 'text-amber-600'
                      }
                    >
                      {v.isConfirmed ? 'Đã xác nhận' : 'Chờ xác nhận'}
                    </span>
                  </div>
                  <div className="text-ink-500">
                    [{v.severity}] {v.description}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
