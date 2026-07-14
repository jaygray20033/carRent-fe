// src/components/enterprise/VASSelector.jsx
import { useMemo } from 'react';
import { Languages, Shield, Camera, UserRound, Megaphone, Sparkles } from 'lucide-react';
import clsx from 'clsx';

const ICONS = {
  INTERPRETER: Languages,
  SECURITY: Shield,
  MEDIA_TEAM: Megaphone,
  ASSISTANT: UserRound,
  PHOTOGRAPHER: Camera,
};

function formatVnd(n) {
  return `${Math.round(Number(n) || 0).toLocaleString('vi-VN')}đ`;
}

/**
 * @param {{
 *   items: Array<{ vasId?: number, id?: number, code, name, unit, unitPrice, basePrice?, requiresHeadcount?, isActive? }>,
 *   value: Record<number, { enabled: boolean, headcount: number, note?: string }>,
 *   onChange: (next) => void
 * }} props
 */
export default function VASSelector({ items = [], value = {}, onChange }) {
  const activeItems = useMemo(
    () => (items || []).filter((v) => v.isActive !== false),
    [items]
  );

  const total = useMemo(() => {
    let sum = 0;
    for (const item of activeItems) {
      const id = item.vasId ?? item.id;
      const row = value[id];
      if (!row?.enabled) continue;
      const hc = Math.max(1, Number(row.headcount) || 1);
      const unit = Math.round(Number(item.unitPrice ?? item.basePrice) || 0);
      sum += hc * unit;
    }
    return sum;
  }, [activeItems, value]);

  const setRow = (id, patch) => {
    const prev = value[id] || { enabled: false, headcount: 1, note: '' };
    onChange({ ...value, [id]: { ...prev, ...patch } });
  };

  return (
    <div data-testid="vas-selector" className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {activeItems.map((item) => {
          const id = item.vasId ?? item.id;
          const row = value[id] || { enabled: false, headcount: 1, note: '' };
          const Icon = ICONS[item.code] || Sparkles;
          const unit = Math.round(Number(item.unitPrice ?? item.basePrice) || 0);
          return (
            <div
              key={id}
              data-testid={`vas-card-${item.code || id}`}
              className={clsx(
                'rounded-2xl border p-4 transition',
                row.enabled
                  ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/30'
                  : 'border-ink-100 bg-white hover:border-ink-200'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-50 text-brand-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="font-semibold text-ink-700">{item.name}</div>
                    <div className="text-xs text-ink-400">
                      {formatVnd(unit)} / {item.unit}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  aria-pressed={row.enabled}
                  data-testid={`vas-toggle-${id}`}
                  onClick={() => setRow(id, { enabled: !row.enabled })}
                  className={clsx(
                    'rounded-full px-3 py-1 text-xs font-semibold',
                    row.enabled
                      ? 'bg-brand-primary text-white'
                      : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                  )}
                >
                  {row.enabled ? 'Đã chọn' : 'Chọn'}
                </button>
              </div>

              {row.enabled && (
                <div className="mt-3 space-y-2">
                  {(item.requiresHeadcount !== false) && (
                    <label className="block text-xs text-ink-500">
                      Số lượng
                      <input
                        type="number"
                        min={1}
                        data-testid={`vas-headcount-${id}`}
                        value={row.headcount}
                        onChange={(e) =>
                          setRow(id, { headcount: Math.max(1, Number(e.target.value) || 1) })
                        }
                        className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-1.5 text-sm"
                      />
                    </label>
                  )}
                  <label className="block text-xs text-ink-500">
                    Yêu cầu đặc biệt
                    <input
                      type="text"
                      data-testid={`vas-note-${id}`}
                      value={row.note || ''}
                      onChange={(e) => setRow(id, { note: e.target.value })}
                      placeholder="VD: Phiên dịch tiếng Anh - Hàn"
                      className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-1.5 text-sm"
                    />
                  </label>
                  <div className="text-right text-sm font-semibold text-ink-700">
                    {formatVnd(Math.max(1, Number(row.headcount) || 1) * unit)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        data-testid="vas-total"
        className="rounded-xl bg-ink-50 px-4 py-3 text-sm font-semibold text-ink-700"
      >
        Tổng VAS: {formatVnd(total)}
      </div>
    </div>
  );
}
