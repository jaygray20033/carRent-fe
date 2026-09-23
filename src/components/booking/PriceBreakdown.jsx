// src/components/booking/PriceBreakdown.jsx — live-update pricing
import { formatCurrency } from '../../utils/format.js';
import { calcRentalDays } from '../../utils/booking.js';

/**
 * PriceBreakdown — reusable on PDP BookingWidget and Checkout page.
 *
 * Two modes:
 *  - PDP widget (client estimate): pass pricePerDay + dates + insuranceType.
 *  - Checkout (server-driven): pass a `breakdown` object straight from the
 *    booking API (base, driver_fee, insurance, dropoff, tax, discount, deposit,
 *    total). This is the source of truth (matches the D11 backend formula), so
 *    the checkout total can never drift from what the server will charge.
 */
export default function PriceBreakdown({
  pricePerDay = 0,
  pickupDate,
  returnDate,
  insuranceType = 'basic', // 'basic' | 'premium'
  deliveryFee = 0,
  showDelivery = false,
  breakdown = null,
}) {
  if (breakdown) return <ServerBreakdown b={breakdown} />;

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

/** One label/value row. `accent` colours the value (discount → green). */
function Line({ label, value, muted = false, accent }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={muted ? 'text-ink-400' : 'text-ink-500'}>{label}</span>
      <span className={`font-medium ${accent ?? 'text-ink-700'}`}>{value}</span>
    </div>
  );
}

/**
 * Server-driven breakdown — renders the exact D11 booking fields the API
 * returned. Only shows lines that are non-zero (base + total always shown) so
 * a plain self-drive booking stays uncluttered.
 */
function ServerBreakdown({ b }) {
  const num = (v) => Number(v) || 0;
  const basePrice = num(b.basePrice ?? b.pricePerDay * b.totalDays);
  const driverFee = num(b.driverFee);
  const insuranceFee = num(b.insuranceFee);
  const dropoffPenalty = num(b.dropoffPenalty);
  const taxAmount = num(b.taxAmount);
  const discount = num(b.couponDiscount);
  const deposit = num(b.depositAmount);
  const subtotal = num(b.subtotal);
  const total = num(b.totalAmount);

  return (
    <div className="space-y-2.5">
      <Line label={`Đơn giá / ngày`} value={`${formatCurrency(b.pricePerDay)}`} />
      <Line label="Số ngày thuê" value={`${b.totalDays} ngày`} />
      <Line label="Phí thuê xe" value={formatCurrency(basePrice)} />
      {driverFee > 0 && <Line label="Phí tài xế" value={formatCurrency(driverFee)} />}
      {insuranceFee > 0 && <Line label="Bảo hiểm" value={formatCurrency(insuranceFee)} />}
      {dropoffPenalty > 0 && (
        <Line label="Phụ phí trả khác điểm" value={formatCurrency(dropoffPenalty)} />
      )}
      {taxAmount > 0 && (
        <Line
          label={`Thuế VAT${b.taxRate ? ` (${b.taxRate}%)` : ''}`}
          value={formatCurrency(taxAmount)}
        />
      )}

      <div className="border-t border-ink-100 pt-2.5 mt-2.5 space-y-2.5">
        <Line label="Tạm tính" value={formatCurrency(subtotal)} muted />
        {discount > 0 && (
          <Line
            label="Giảm giá (coupon)"
            value={`− ${formatCurrency(discount)}`}
            accent="text-emerald-600"
          />
        )}
        {deposit > 0 && (
          <Line label="Đặt cọc (hoàn lại)" value={formatCurrency(deposit)} muted />
        )}
      </div>

      <div className="border-t border-ink-100 pt-2.5 mt-2.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-ink-900">Tổng thanh toán</span>
          <span className="text-lg font-bold text-brand-primary">{formatCurrency(total)}</span>
        </div>
        {deposit > 0 && (
          <p className="mt-1 text-[10px] text-ink-400">
            Đã bao gồm {formatCurrency(deposit)} tiền cọc, sẽ hoàn lại sau khi trả xe.
          </p>
        )}
      </div>
    </div>
  );
}
