// src/components/enterprise/vasTotal.js
export function computeVasTotal(items = [], value = {}) {
  let sum = 0;
  for (const item of items) {
    if (item.isActive === false) continue;
    const id = item.vasId ?? item.id;
    const row = value[id];
    if (!row?.enabled) continue;
    const hc = Math.max(1, Number(row.headcount) || 1);
    const unit = Math.round(Number(item.unitPrice ?? item.basePrice) || 0);
    sum += hc * unit;
  }
  return sum;
}
