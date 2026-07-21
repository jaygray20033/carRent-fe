import { formatVND } from '../utils/format'
import type { PriceBreakdownData } from '../utils/types'

interface PriceBreakdownProps {
  data: PriceBreakdownData
  couponApplied: boolean
  couponCode: string
}

export default function PriceBreakdown({ data, couponApplied, couponCode }: PriceBreakdownProps) {
  return (
    <div className="price-breakdown sticky top-24">
      {/* Header */}
      <div className="bg-[#1a2332] text-white px-6 py-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <svg className="w-5 h-5 text-[#f5a623]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Tính toán chi phí
        </h3>
      </div>

      {/* Content */}
      <div className="px-6 py-5">
        {/* Rental costs */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Chi phí thuê xe</h4>
          <div className="space-y-1">
            <PriceRow label={`Chi phí thuê hàng ngày (×${data.rentalDays} ngày)`} value={data.rentalSubtotal} />
            <PriceRow label="Phí giao xe tận nơi tại điểm đi" value={data.deliveryPickup} />
            <PriceRow label="Phí nhận xe tận nơi tại điểm đi" value={data.deliveryReturn} />
            <PriceRow label="Thuế" value={data.tax} />
            <div className="border-t border-gray-100 mt-2 pt-2">
              <PriceRow label="Tổng chi phí thuê xe" value={data.totalRentalCost} bold />
            </div>
          </div>
        </div>

        {/* Deposit */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Tiền đặt cọc</h4>
          <div className="space-y-1">
            <PriceRow label="Tiền đặt cọc bảo lãnh cố định" value={data.insuranceDeposit} />
            <PriceRow label="Tiền đặt cọc (cố định)" value={data.fixedDeposit} />
            <PriceRow label="Tiền đặt cọc bảo lãnh vi phạm giao thông" value={data.trafficViolationDeposit} />
            <div className="border-t border-gray-100 mt-2 pt-2">
              <PriceRow label="Tổng chi phí bao gồm và tiền đặt cọc" value={data.totalDeposit} bold />
            </div>
          </div>
        </div>

        {/* Coupon discount */}
        {couponApplied && data.couponDiscount > 0 && (
          <div className="mb-4 animate-fade-in">
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="text-green-700 text-sm font-medium">
                Mã <span className="font-bold">{couponCode}</span>
              </span>
              <span className="ml-auto text-green-700 text-sm font-bold">
                -{formatVND(data.couponDiscount)}
              </span>
            </div>
          </div>
        )}

        {/* Grand total */}
        <div className="price-total-highlight animate-fade-in">
          <span className="font-bold text-[#1a2332]">Số tiền cần thanh toán</span>
          <span className="text-xl font-extrabold text-[#f5a623]">
            {formatVND(data.grandTotal)}
            <span className="text-sm font-semibold ml-1">VND</span>
          </span>
        </div>
      </div>
    </div>
  )
}

function PriceRow({ label, value, bold = false }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className={`price-row ${bold ? 'font-semibold text-[#1a2332]' : 'text-gray-600'}`}>
      <span className="text-sm pr-4">{label}</span>
      <span className={`whitespace-nowrap ${bold ? 'text-[#1a2332]' : ''}`}>
        {formatVND(value)}
      </span>
    </div>
  )
}
