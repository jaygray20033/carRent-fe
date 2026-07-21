// src/components/enterprise/CostSummaryCard.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CostSummaryCard from './CostSummaryCard.jsx';

describe('CostSummaryCard', () => {
  it('renders base + VAS + VAT = total', () => {
    render(
      <CostSummaryCard
        summary={{
          basePrice: 1_300_000,
          vas: [
            { name: 'Phiên dịch viên', headcount: 2, unitPrice: 500000, total: 1_000_000 },
            { name: 'Bảo vệ', headcount: 1, unitPrice: 800000, total: 800000 },
          ],
          vasTotal: 1_800_000,
          expenses: [],
          expenseTotal: 0,
          subtotal: 3_100_000,
          vat10: 310_000,
          total: 3_410_000,
        }}
      />
    );
    expect(screen.getByTestId('cost-summary-vas')).toBeInTheDocument();
    expect(screen.getByText(/Tổng cộng/i)).toBeInTheDocument();
  });

  it('hides VAS section when no VAS', () => {
    render(
      <CostSummaryCard
        summary={{
          basePrice: 1_000_000,
          vas: [],
          vasTotal: 0,
          expenses: [],
          expenseTotal: 0,
          subtotal: 1_000_000,
          vat10: 100_000,
          total: 1_100_000,
        }}
      />
    );
    expect(screen.queryByTestId('cost-summary-vas')).not.toBeInTheDocument();
  });
});
