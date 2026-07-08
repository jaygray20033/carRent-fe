// DateRangePicker component tests (Day 42).
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DateRangePicker from './DateRangePicker.jsx';

describe('DateRangePicker', () => {
  beforeEach(() => {
    // Freeze "now" so min-pickup / calendar month are deterministic.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-15T09:00:00'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the two date buttons with a placeholder when empty', () => {
    render(<DateRangePicker />);
    expect(screen.getByText('Ngày nhận')).toBeInTheDocument();
    expect(screen.getByText('Ngày trả')).toBeInTheDocument();
    expect(screen.getAllByText('Chọn ngày')).toHaveLength(2);
  });

  it('formats provided pickup/return dates as DD/MM/YYYY', () => {
    render(<DateRangePicker pickupDate="2026-08-20" returnDate="2026-08-22" />);
    expect(screen.getByText('20/08/2026')).toBeInTheDocument();
    expect(screen.getByText('22/08/2026')).toBeInTheDocument();
  });

  it('opens the calendar and picks a pickup date, advancing to return selection', () => {
    const onPickup = vi.fn();
    render(<DateRangePicker onPickupChange={onPickup} onReturnChange={vi.fn()} />);

    fireEvent.click(screen.getAllByText('Chọn ngày')[0]);
    // Calendar shows the current month header (Tháng 8, 2026).
    expect(screen.getByText(/Tháng 8, 2026/)).toBeInTheDocument();

    // Click day 20 (a valid future date). Scope to the calendar grid buttons.
    const day = screen.getByRole('button', { name: '20' });
    fireEvent.click(day);
    expect(onPickup).toHaveBeenCalledWith('2026-08-20');
  });

  it('disables booked dates so clicking them does nothing', () => {
    const onPickup = vi.fn();
    render(
      <DateRangePicker
        onPickupChange={onPickup}
        onReturnChange={vi.fn()}
        bookedRanges={[{ from: '2026-08-20', to: '2026-08-20' }]}
      />
    );

    fireEvent.click(screen.getAllByText('Chọn ngày')[0]);
    const day = screen.getByRole('button', { name: '20' });
    expect(day).toBeDisabled();
    fireEvent.click(day);
    expect(onPickup).not.toHaveBeenCalled();
  });
});
