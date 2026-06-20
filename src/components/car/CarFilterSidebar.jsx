import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { ChevronUp } from 'lucide-react';
import { brandService } from '../../services/brandService.js';

// Price slider bounds (§ "Phân khúc giá" — slider 100tr–1 tỷ)
// We store price in VND/day for filtering, but the slider in the Figma reads
// "100 triệu VND … 1 tỷ VND". We map the slider track to a per-day price range
// that covers the seeded catalogue (1tr → 15tr / day) so it filters real data.
const PRICE_MIN = 1_000_000; // 1 triệu / ngày
const PRICE_MAX = 15_000_000; // 15 triệu / ngày
const PRICE_STEP = 500_000;

const SEATS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: '4', label: '4 chỗ' },
  { value: '5', label: '5 chỗ' },
  { value: '7', label: '7 chỗ' },
  { value: '16', label: '16 chỗ' },
];

const TRANSMISSION_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'AUTO', label: 'Số tự động' },
  { value: 'MANUAL', label: 'Số sàn' },
];

const FUEL_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'GASOLINE', label: 'Xăng' },
  { value: 'DIESEL', label: 'Dầu' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'ELECTRIC', label: 'Điện' },
];

// § "Thuê xe theo nhu cầu" — radio
const NEEDS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'WITH_DRIVER', label: 'Có tài xế' },
  { value: 'SELF_DRIVE', label: 'Tự lái' },
  { value: 'IN_PROVINCE', label: 'Trong tỉnh' },
  { value: 'LUXURY', label: 'Hạng sang' },
  { value: 'EVENT', label: 'Sự kiện' },
  { value: 'WEDDING', label: 'Đám cưới' },
];

function formatVnd(n) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(n % 1_000_000_000 ? 1 : 0)} tỷ`;
  if (n >= 1_000_000) return `${Math.round(n / 1_000_000)} triệu`;
  return new Intl.NumberFormat('vi-VN').format(n);
}

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-ink-100 py-4 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-semibold text-ink-900">{title}</span>
        <ChevronUp
          className={`h-4 w-4 text-ink-400 transition-transform ${open ? '' : 'rotate-180'}`}
        />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

/**
 * CarFilterSidebar — PLP filter panel (Figma: filter on the right column).
 * Controlled component: parent owns `value`, sidebar emits changes via onChange
 * (live) and onApply/onReset for the action buttons.
 */
export default function CarFilterSidebar({ value, onChange, onApply, onReset }) {
  const { data: brandsResp } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandService.list(),
    staleTime: 60 * 60 * 1000,
  });
  const brands = brandsResp?.data?.brands ?? [];

  // Local price range (debounced commit on slider release)
  const [price, setPrice] = useState([
    Number(value.price_min) || PRICE_MIN,
    Number(value.price_max) || PRICE_MAX,
  ]);

  // Keep the local slider value in sync whenever the parent-owned filter
  // value changes (e.g. "Xoá bộ lọc"). This intentionally mirrors external
  // state into local state, so the set-state-in-effect rule is disabled here.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrice([Number(value.price_min) || PRICE_MIN, Number(value.price_max) || PRICE_MAX]);
  }, [value.price_min, value.price_max]);

  const set = (patch) => onChange?.(patch);

  const toggleBrand = (slug) => {
    const current = value.brand ? value.brand.split(',').filter(Boolean) : [];
    const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
    set({ brand: next.join(',') });
  };
  const selectedBrands = value.brand ? value.brand.split(',').filter(Boolean) : [];

  return (
    <aside className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
      {/* ── Phân khúc giá ── */}
      <Section title="Phân khúc giá">
        <div className="px-1">
          <Slider
            range
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={PRICE_STEP}
            value={price}
            allowCross={false}
            onChange={(v) => setPrice(v)}
            onChangeComplete={(v) => set({ price_min: v[0], price_max: v[1] })}
            styles={{
              track: { backgroundColor: '#004ede', height: 4 },
              rail: { backgroundColor: '#e5e8ef', height: 4 },
              handle: {
                borderColor: '#004ede',
                backgroundColor: '#fff',
                opacity: 1,
                boxShadow: '0 1px 4px rgba(0,0,0,.2)',
              },
            }}
          />
          <div className="mt-3 flex items-center justify-between text-xs text-ink-500">
            <span>{formatVnd(price[0])} VND</span>
            <span>{formatVnd(price[1])} VND</span>
          </div>
        </div>
      </Section>

      {/* ── Thương hiệu xe ── */}
      <Section title="Thương hiệu xe">
        <div className="max-h-56 space-y-2.5 overflow-y-auto pr-1">
          {brands.length === 0 && <p className="text-xs text-ink-400">Đang tải…</p>}
          {brands.map((b) => (
            <label
              key={b.id}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-700"
            >
              <input
                type="checkbox"
                checked={selectedBrands.includes(b.slug)}
                onChange={() => toggleBrand(b.slug)}
                className="h-4 w-4 rounded border-ink-300 text-brand-primary focus:ring-brand-primary-light"
              />
              <span className="flex-1">{b.name}</span>
              {b._count?.vehicles != null && (
                <span className="text-xs text-ink-300">({b._count.vehicles})</span>
              )}
            </label>
          ))}
        </div>
      </Section>

      {/* ── Thuê xe theo nhu cầu (radio) ── */}
      <Section title="Thuê xe theo nhu cầu">
        <div className="space-y-2.5">
          {NEEDS_OPTIONS.map((opt) => (
            <label
              key={opt.value || 'all'}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-700"
            >
              <input
                type="radio"
                name="needs"
                checked={(value.type || '') === opt.value}
                onChange={() => set({ type: opt.value })}
                className="h-4 w-4 border-ink-300 text-brand-primary focus:ring-brand-primary-light"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </Section>

      {/* ── Số chỗ ── */}
      <Section title="Số chỗ">
        <div className="flex flex-wrap gap-2">
          {SEATS_OPTIONS.map((opt) => {
            const active = (value.seats || '') === opt.value;
            return (
              <button
                key={opt.value || 'all'}
                type="button"
                onClick={() => set({ seats: opt.value })}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? 'border-brand-primary bg-brand-primary text-white'
                    : 'border-ink-100 text-ink-700 hover:border-brand-primary'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── Hộp số ── */}
      <Section title="Hộp số">
        <div className="flex flex-wrap gap-2">
          {TRANSMISSION_OPTIONS.map((opt) => {
            const active = (value.transmission || '') === opt.value;
            return (
              <button
                key={opt.value || 'all'}
                type="button"
                onClick={() => set({ transmission: opt.value })}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? 'border-brand-primary bg-brand-primary text-white'
                    : 'border-ink-100 text-ink-700 hover:border-brand-primary'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── Nhiên liệu ── */}
      <Section title="Nhiên liệu">
        <div className="flex flex-wrap gap-2">
          {FUEL_OPTIONS.map((opt) => {
            const active = (value.fuel || '') === opt.value;
            return (
              <button
                key={opt.value || 'all'}
                type="button"
                onClick={() => set({ fuel: opt.value })}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? 'border-brand-primary bg-brand-primary text-white'
                    : 'border-ink-100 text-ink-700 hover:border-brand-primary'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── Actions ── */}
      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={onReset}
          className="flex-1 rounded-lg border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
        >
          Xoá bộ lọc
        </button>
        <button
          type="button"
          onClick={onApply}
          className="flex-1 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-primary-dark"
        >
          Áp dụng
        </button>
      </div>
    </aside>
  );
}
