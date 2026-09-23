// src/components/corporate/PriceTable.jsx
// Renders the nested corporate price config { <seatType>: { <tier>: price } }
// as a matrix: one row per tier, one column per seat type. Column order follows
// the config's own key order; tier rows follow TIER_LABELS first, then extras.

const SEAT_LABELS = {
  '4_5_seat': '4–5 chỗ',
  '7_seat': '7 chỗ',
  '16_seat': '16 chỗ',
  '29_seat': '29 chỗ',
  '45_seat': '45 chỗ',
};

const TIER_LABELS = {
  half_day_0_100km: 'Nửa ngày · 0–100 km',
  half_day_100_150km: 'Nửa ngày · 100–150 km',
  full_day_100_150km: 'Cả ngày · 100–150 km',
  full_day_150_200km: 'Cả ngày · 150–200 km',
};

// Fallback for keys not in the label maps: "full_day_150_200km" → "full day 150 200km".
const humanize = (key) => key.replace(/_/g, ' ');
const formatVnd = (n) => `${Number(n).toLocaleString('vi-VN')}đ`;

export default function PriceTable({ priceConfig }) {
  const seatTypes = Object.keys(priceConfig || {});
  if (seatTypes.length === 0) {
    return <p className="text-sm text-ink-400">Chưa có bảng giá</p>;
  }

  // Union of every tier key across seat types, ordered by TIER_LABELS then extras.
  const seen = new Set();
  seatTypes.forEach((s) => Object.keys(priceConfig[s] || {}).forEach((t) => seen.add(t)));
  const tiers = [
    ...Object.keys(TIER_LABELS).filter((t) => seen.has(t)),
    ...[...seen].filter((t) => !(t in TIER_LABELS)),
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-ink-100 text-left text-ink-500">
            <th className="py-2 pr-3 font-medium">Gói thuê</th>
            {seatTypes.map((s) => (
              <th key={s} className="py-2 px-3 text-right font-medium">
                {SEAT_LABELS[s] || humanize(s)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tiers.map((tier) => (
            <tr key={tier} className="border-b border-ink-50 last:border-0">
              <td className="py-2 pr-3 text-ink-600">{TIER_LABELS[tier] || humanize(tier)}</td>
              {seatTypes.map((s) => {
                const price = priceConfig[s]?.[tier];
                return (
                  <td key={s} className="py-2 px-3 text-right font-medium text-ink-800">
                    {price != null ? formatVnd(price) : '—'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
