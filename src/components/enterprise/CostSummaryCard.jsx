// src/components/enterprise/CostSummaryCard.jsx
function formatVnd(n) {
  return `${Math.round(Number(n) || 0).toLocaleString('vi-VN')}đ`;
}

/**
 * @param {{
 *   basePrice?: number,
 *   vas?: Array<{ name, headcount, unitPrice, total }>,
 *   expenses?: Array<{ type, amount }>,
 *   expenseTotal?: number,
 *   vasTotal?: number,
 *   subtotal?: number,
 *   vat10?: number,
 *   total?: number
 * }} summary
 */
export default function CostSummaryCard({ summary }) {
  if (!summary) return null;
  const vas = summary.vas || [];
  const expenses = summary.expenses || [];
  const hasVas = vas.length > 0 && (summary.vasTotal || 0) > 0;

  return (
    <div
      data-testid="cost-summary-card"
      className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100"
    >
      <h3 className="mb-3 font-semibold text-ink-700">Tóm tắt chi phí</h3>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-500">Giá thuê xe</dt>
          <dd className="font-medium text-ink-700">{formatVnd(summary.basePrice)}</dd>
        </div>

        {hasVas && (
          <div data-testid="cost-summary-vas">
            <div className="mb-1 font-medium text-ink-600">Dịch vụ gia tăng</div>
            <ul className="space-y-1 pl-2">
              {vas.map((v, i) => (
                <li key={v.id || i} className="flex justify-between text-ink-500">
                  <span>
                    {v.name} ×{v.headcount}
                  </span>
                  <span>{formatVnd(v.total)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-1 flex justify-between">
              <dt className="text-ink-500">Tổng VAS</dt>
              <dd className="font-medium text-ink-700">{formatVnd(summary.vasTotal)}</dd>
            </div>
          </div>
        )}

        {expenses.length > 0 && (
          <div className="flex justify-between">
            <dt className="text-ink-500">Chi phí phát sinh</dt>
            <dd className="font-medium text-ink-700">{formatVnd(summary.expenseTotal)}</dd>
          </div>
        )}

        <div className="flex justify-between border-t border-ink-100 pt-2">
          <dt className="text-ink-500">Tạm tính</dt>
          <dd className="font-medium text-ink-700">{formatVnd(summary.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-500">VAT 10%</dt>
          <dd className="font-medium text-ink-700">{formatVnd(summary.vat10)}</dd>
        </div>
        <div className="flex justify-between border-t border-ink-100 pt-2 text-base">
          <dt className="font-semibold text-ink-700">Tổng cộng</dt>
          <dd className="font-bold text-brand-primary">{formatVnd(summary.total)}</dd>
        </div>
      </dl>
    </div>
  );
}
