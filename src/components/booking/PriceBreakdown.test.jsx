// PriceBreakdown component tests (Day 42).
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PriceBreakdown from './PriceBreakdown.jsx';

// Two whole days apart so calcRentalDays → 2.
const PICKUP = '2026-08-01';
const RETURN = '2026-08-03';

describe('PriceBreakdown', () => {
  it('prompts to pick dates when no range is selected', () => {
    render(<PriceBreakdown pricePerDay={500000} />);
    expect(screen.getByText(/Chọn ngày thuê/)).toBeInTheDocument();
  });

  it('computes base price = pricePerDay × days for a basic booking', () => {
    render(<PriceBreakdown pricePerDay={500000} pickupDate={PICKUP} returnDate={RETURN} />);
    expect(screen.getByText('2 ngày')).toBeInTheDocument();
    // base = 500.000 × 2 = 1.000.000, which is also the total (no insurance)
    expect(screen.getAllByText(/1\.000\.000/).length).toBeGreaterThanOrEqual(1);
  });

  it('adds a premium insurance line of 200.000/day', () => {
    render(
      <PriceBreakdown
        pricePerDay={500000}
        pickupDate={PICKUP}
        returnDate={RETURN}
        insuranceType="premium"
      />
    );
    expect(screen.getByText('Bảo hiểm Premium')).toBeInTheDocument();
    // insurance = 200.000 × 2 = 400.000 (anchor so it doesn't match the 1.400.000 total)
    expect(screen.getByText(/^400\.000\s*₫$/)).toBeInTheDocument();
    // total = 1.000.000 + 400.000 = 1.400.000
    expect(screen.getByText(/^1\.400\.000\s*₫$/)).toBeInTheDocument();
  });

  it('hides the delivery line unless showDelivery is set with a positive fee', () => {
    const { rerender } = render(
      <PriceBreakdown
        pricePerDay={500000}
        pickupDate={PICKUP}
        returnDate={RETURN}
        deliveryFee={150000}
      />
    );
    expect(screen.queryByText('Phí giao xe')).not.toBeInTheDocument();

    rerender(
      <PriceBreakdown
        pricePerDay={500000}
        pickupDate={PICKUP}
        returnDate={RETURN}
        deliveryFee={150000}
        showDelivery
      />
    );
    expect(screen.getByText('Phí giao xe')).toBeInTheDocument();
    // total = 1.000.000 + 150.000 = 1.150.000
    expect(screen.getByText(/1\.150\.000/)).toBeInTheDocument();
  });
});
