// src/pages/enterprise/ContractPage.jsx
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useOutletContext } from 'react-router-dom';
import { enterpriseService } from '../../services/enterpriseService.js';
import Loading from '../../components/common/Loading.jsx';
import { formatDateTime } from '../../utils/format.js';

const SIGN_BADGE = {
  PENDING: 'bg-amber-100 text-amber-800',
  SIGNED_ONE: 'bg-sky-100 text-sky-800',
  SIGNED_BOTH: 'bg-violet-100 text-violet-800',
  EFFECTIVE: 'bg-emerald-100 text-emerald-800',
};

export default function EnterpriseContractPage() {
  const { corporate, isAdmin } = useOutletContext() || {};
  const qc = useQueryClient();

  const { data: priceRes } = useQuery({
    queryKey: ['enterprise', 'priceConfig'],
    queryFn: () => enterpriseService.myPriceConfig(),
  });
  const { data: vasRes } = useQuery({
    queryKey: ['enterprise', 'vasPricing'],
    queryFn: () => enterpriseService.myVasPricing(),
  });
  const { data: amdRes, isLoading } = useQuery({
    queryKey: ['enterprise', 'amendments'],
    queryFn: () => enterpriseService.listAmendments(),
  });

  const priceConfig = (priceRes?.data ?? priceRes)?.priceConfig || {};
  const vasItems = (vasRes?.data ?? vasRes)?.items || [];
  const amendments = (amdRes?.data ?? amdRes)?.items || [];

  const signMut = useMutation({
    mutationFn: (id) => enterpriseService.signAmendmentA(id),
    onSuccess: () => {
      toast.success('Đã ký xác nhận phụ lục (Bên A)');
      qc.invalidateQueries({ queryKey: ['enterprise', 'amendments'] });
      qc.invalidateQueries({ queryKey: ['enterprise', 'priceConfig'] });
    },
    onError: (err) => toast.error(err?.message || 'Không ký được'),
  });

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-ink-700">Hợp đồng & Phụ lục</h1>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
        <h2 className="font-semibold text-ink-700">Hợp đồng khung</h2>
        <div className="mt-2 grid gap-2 text-sm text-ink-600 sm:grid-cols-2">
          <div>Số HĐ: <strong>{corporate?.contractRef || '—'}</strong></div>
          <div>MST: {corporate?.taxCode || '—'}</div>
          <div>
            Hiệu lực: {corporate?.contractStart ? formatDateTime(corporate.contractStart) : '—'} →{' '}
            {corporate?.contractEnd ? formatDateTime(corporate.contractEnd) : '—'}
          </div>
          <div>Công ty: {corporate?.name || '—'}</div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
          <h2 className="mb-2 font-semibold text-ink-700">Bảng giá xe</h2>
          <pre className="max-h-64 overflow-auto rounded-xl bg-ink-50 p-3 text-xs text-ink-600">
            {JSON.stringify(priceConfig, null, 2)}
          </pre>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
          <h2 className="mb-2 font-semibold text-ink-700">Bảng giá VAS</h2>
          <ul className="space-y-1 text-sm text-ink-600">
            {vasItems.map((v) => (
              <li key={v.vasId || v.id} className="flex justify-between">
                <span>{v.name}</span>
                <span>
                  {Number(v.unitPrice).toLocaleString('vi-VN')}đ
                  {v.isNegotiated ? ' (đàm phán)' : ''}
                </span>
              </li>
            ))}
            {vasItems.length === 0 && <li className="text-ink-400">Chưa có VAS</li>}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
        <h2 className="mb-3 font-semibold text-ink-700">Phụ lục</h2>
        <ul className="space-y-3">
          {amendments.map((a) => (
            <li
              key={a.id}
              className="rounded-xl border border-ink-100 p-4 text-sm text-ink-600"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <strong>{a.amendmentNo}</strong> — {a.title}
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    SIGN_BADGE[a.signStatus] || SIGN_BADGE.PENDING
                  }`}
                >
                  {a.signStatus === 'EFFECTIVE'
                    ? 'Có hiệu lực'
                    : a.signStatus === 'SIGNED_BOTH'
                      ? 'Đã ký 2 bên'
                      : a.signStatus === 'SIGNED_ONE'
                        ? 'Đã ký 1 bên'
                        : 'Chờ ký'}
                </span>
              </div>
              <div className="mt-1 text-xs text-ink-400">
                Hiệu lực từ {formatDateTime(a.effectiveDate)} · A:{' '}
                {a.signedByA ? '✓' : '—'} · B: {a.signedByB ? '✓' : '—'}
              </div>
              {a.documentUrl && (
                <a
                  href={a.documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm font-semibold text-brand-primary"
                >
                  Tải PDF phụ lục
                </a>
              )}
              {isAdmin && !a.signedByA && (
                <button
                  type="button"
                  className="mt-2 ml-0 block rounded-xl bg-brand-primary px-3 py-1.5 text-xs font-semibold text-white sm:ml-3 sm:inline-block"
                  disabled={signMut.isPending}
                  onClick={() => {
                    if (window.confirm(`Ký xác nhận phụ lục ${a.amendmentNo}?`)) {
                      signMut.mutate(a.id);
                    }
                  }}
                >
                  Ký xác nhận (Bên A)
                </button>
              )}
            </li>
          ))}
          {amendments.length === 0 && (
            <li className="text-sm text-ink-400">Chưa có phụ lục</li>
          )}
        </ul>
      </div>
    </div>
  );
}
