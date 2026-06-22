// src/components/booking/PriceBreakdown.jsx — live-update pricing
import { formatCurrency } from '../../utils/format.js';
import { calcRentalDays } from '../../utils/booking.js';

/**
 * PriceBreakdown — reusable on PDP BookingWidget and Checkout page.
 */
export default function PriceBreakdown({
  pricePerDay = 0,
  pickupDate,
  returnDate,
  insuranceType = 'basic', // 'basic' | 'premium'
  deliveryFee = 0,
  showDelivery = false,
}) {
  const days = pickupDate && returnDate ? calcRentalDays(pickupDate, returnDate) : 0;
  const basePrice = Number(pricePerDay) * days;
  const insuranceFee = insuranceType === 'premium' ? 200000 * days : 0;
  const total = basePrice + insuranceFee + (showDelivery ? deliveryFee : 0);

  if (days === 0) {
    return (
      <div className="text-center py-3">
        <p className="text-xs text-ink-400">Chọn ngày thuê để xem chi phí</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink-500">Đơn giá</span>
        <span className="font-medium text-ink-700">{formatCurrency(pricePerDay)}/ngày</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink-500">Số ngày thuê</span>
        <span className="font-medium text-ink-700">{days} ngày</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink-500">Phí thuê xe</span>
        <span className="font-medium text-ink-700">{formatCurrency(basePrice)}</span>
      </div>
      {insuranceType === 'premium' && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-500">Bảo hiểm Premium</span>
          <span className="font-medium text-ink-700">{formatCurrency(insuranceFee)}</span>
        </div>
      )}
      {showDelivery && deliveryFee > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-500">Phí giao xe</span>
          <span className="font-medium text-ink-700">{formatCurrency(deliveryFee)}</span>
        </div>
      )}

      <div className="border-t border-ink-100 pt-2.5 mt-2.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-ink-900">Tổng cộng</span>
          <span className="text-lg font-bold text-brand-primary">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
