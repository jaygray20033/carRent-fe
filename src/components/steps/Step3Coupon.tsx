import { useState, useCallback } from 'react'
import { validCoupons } from '../../utils/mockData'
import { formatVND } from '../../utils/format'
import type { CouponResult, PriceBreakdownData } from '../../utils/types'

interface Step3Props {
  priceData: PriceBreakdownData
  couponCode: string
  couponResult: CouponResult | null
  onApplyCoupon: (result: CouponResult, code: string) => void
  onRemoveCoupon: () => void
  onBack: () => void
  onNext: () => void
}

export default function Step3Coupon({
  priceData,
  couponCode: appliedCode,
  couponResult,
  onApplyCoupon,
  onRemoveCoupon,
  onBack,
  onNext,
}: Step3Props) {
  const [inputCode, setInputCode] = useState(appliedCode)
  const [validating, setValidating] = useState(false)
  const [localError, setLocalError] = useState('')

  const handleValidateCoupon = useCallback(() => {
    if (!inputCode.trim()) {
      setLocalError('Vui lòng nhập mã giảm giá')
      return
    }

    setValidating(true)
    setLocalError('')

    // Simulate API call with 500ms delay
    setTimeout(() => {
      const code = inputCode.trim().toUpperCase()
      const coupon = validCoupons[code]

      if (coupon) {
        const discountAmount = Math.min(
          Math.round(priceData.totalRentalCost * coupon.discountPercent / 100),
          coupon.maxDiscount,
        )
        onApplyCoupon({
          valid: true,
          code,
          discountAmount,
          discountPercent: coupon.discountPercent,
          message: `Giảm ${coupon.discountPercent}% (tối đa ${formatVND(coupon.maxDiscount)} VND)`,
        }, code)
      } else {
        setLocalError('Mã giảm giá không hợp lệ hoặc đã hết hạn')
      }

      setValidating(false)
    }, 500)
  }, [inputCode, priceData.totalRentalCost, onApplyCoupon])

  const handleRemove = () => {
    setInputCode('')
    setLocalError('')
    onRemoveCoupon()
  }

  const isApplied = couponResult?.valid === true

  return (
    <div className="animate-slide-in">
      {/* Section title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#1a2332] rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-[#f5a623]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1a2332]">Mã giảm giá & Tóm tắt</h2>
          <p className="text-sm text-gray-500">Áp dụng mã giảm giá và kiểm tra tổng chi phí</p>
        </div>
      </div>

      {/* Coupon input card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-base font-bold text-[#1a2332] mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#f5a623]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          Nhập mã giảm giá
        </h3>

        <div className="coupon-input-group">
          <input
            type="text"
            placeholder="Ví dụ: OTORENT10"
            value={inputCode}
            onChange={(e) => {
              setInputCode(e.target.value.toUpperCase())
              setLocalError('')
            }}
            onKeyDown={(e) => e.key === 'Enter' && !isApplied && handleValidateCoupon()}
            className={`${localError ? 'error' : ''} ${isApplied ? 'success' : ''}`}
            disabled={isApplied}
          />
          {isApplied ? (
            <button className="coupon-btn !bg-red-500 hover:!bg-red-600" onClick={handleRemove}>
              Hủy
            </button>
          ) : (
            <button
              className="coupon-btn"
              onClick={handleValidateCoupon}
              disabled={validating || !inputCode.trim()}
            >
              {validating ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang kiểm tra
                </span>
              ) : (
                'Áp dụng'
              )}
            </button>
          )}
        </div>

        {/* Error message */}
        {localError && (
          <p className="mt-2 text-sm text-red-500 flex items-center gap-1 animate-fade-in">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {localError}
          </p>
        )}

        {/* Success message */}
        {isApplied && couponResult && (
          <div className="mt-3 px-4 py-3 bg-green-50 rounded-lg border border-green-200 animate-fade-in">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-green-700">Áp dụng thành công!</p>
                <p className="text-xs text-green-600">{couponResult.message}</p>
              </div>
              <span className="ml-auto text-green-700 font-bold">
                -{formatVND(couponResult.discountAmount)} VND
              </span>
            </div>
          </div>
        )}

        {/* Available coupons hint */}
        {!isApplied && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Mã gợi ý</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(validCoupons).map((code) => (
                <button
                  key={code}
                  onClick={() => {
                    setInputCode(code)
                    setLocalError('')
                  }}
                  className="px-3 py-1.5 text-xs font-mono font-bold text-[#1a2332] bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-[#f5a623] hover:bg-[#fffbf0] transition-all cursor-pointer"
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Price summary card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-bold text-[#1a2332] mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#f5a623]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Tóm tắt chi phí
        </h3>

        <div className="space-y-3">
          <SummaryRow label="Chi phí thuê xe" value={priceData.totalRentalCost} />
          <SummaryRow label="Tiền đặt cọc" value={priceData.totalDeposit} />
          {priceData.couponDiscount > 0 && (
            <SummaryRow label="Giảm giá" value={-priceData.couponDiscount} discount />
          )}
          <div className="border-t-2 border-[#1a2332] pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-[#1a2332]">Tổng cộng</span>
              <span className="text-2xl font-extrabold text-[#f5a623]">
                {formatVND(priceData.grandTotal)} <span className="text-base">VND</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-between mt-6">
        <button className="btn-secondary" onClick={onBack}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          Quay lại
        </button>
        <button className="btn-primary" onClick={onNext}>
          Tiếp tục xác nhận
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function SummaryRow({ label, value, discount = false }: { label: string; value: number; discount?: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-600">{label}</span>
      <span className={`font-semibold ${discount ? 'text-green-600' : 'text-[#1a2332]'}`}>
        {discount ? '-' : ''}{formatVND(Math.abs(value))} VND
      </span>
    </div>
  )
}
