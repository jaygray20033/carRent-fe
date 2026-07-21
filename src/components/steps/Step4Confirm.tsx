import { useState } from 'react'
import { formatVND } from '../../utils/format'
import type { BookingInfo, InsurancePackage, PriceBreakdownData } from '../../utils/types'

interface Step4Props {
  booking: BookingInfo
  insurance: InsurancePackage | undefined
  priceData: PriceBreakdownData
  couponCode: string
  onBack: () => void
  onConfirm: () => void
}

export default function Step4Confirm({
  booking,
  insurance,
  priceData,
  couponCode,
  onBack,
  onConfirm,
}: Step4Props) {
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [agreedPolicy, setAgreedPolicy] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const canSubmit = agreedTerms && agreedPolicy && !submitting

  const handleConfirm = () => {
    if (!canSubmit) return
    setSubmitting(true)

    // Simulate booking creation
    setTimeout(() => {
      setSubmitting(false)
      setShowSuccess(true)
    }, 1500)
  }

  if (showSuccess) {
    return (
      <div className="animate-slide-up text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[#1a2332] mb-2">Đặt xe thành công!</h2>
        <p className="text-gray-500 mb-2">Mã đặt xe: <span className="font-bold text-[#f5a623]">OTR-{Date.now().toString().slice(-8)}</span></p>
        <p className="text-gray-500 mb-8">Bạn sẽ được chuyển sang trang thanh toán trong giây lát...</p>

        <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a2332] text-white rounded-xl font-semibold">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Đang chuyển đến trang thanh toán...
        </div>
      </div>
    )
  }

  return (
    <div className="animate-slide-in">
      {/* Section title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#1a2332] rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-[#f5a623]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1a2332]">Xác nhận điều khoản</h2>
          <p className="text-sm text-gray-500">Kiểm tra lại toàn bộ thông tin và xác nhận đặt xe</p>
        </div>
      </div>

      {/* Deposit info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-base font-bold text-[#1a2332] mb-4">Thông tin đặt cọc</h3>

        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-[#f5a623] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Tôi muốn thanh toán các khoản tiền đặt cọc sau: tiền đặt cọc bảo lãnh thiệt hại bằng <strong>{formatVND(priceData.fixedDeposit)} VND</strong> tiền mặt.</p>
          </div>
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-[#f5a623] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Tôi muốn thanh toán tiền đặt cọc bảo lãnh tiền đặt cọc bảo lãnh thiệt hại bằng <strong>{formatVND(priceData.fixedDeposit)} VND</strong>.</p>
          </div>
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Tiền đặt cọc sẽ đặt cọc tối đa lên đến <strong>100,000,000 VND</strong> và thay đổi tùy thuộc vào các giấy tờ/chứng từ do bạn cung cấp.</p>
          </div>
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Tôi muốn đặt giữ xe trước bằng cách chi thanh toán số tiền là <strong>{formatVND(priceData.fixedDeposit)} VND</strong>.</p>
          </div>
        </div>

        {/* Total payment highlight */}
        <div className="mt-5 price-total-highlight">
          <span className="font-bold text-[#1a2332]">Số tiền cần thanh toán ngay</span>
          <span className="text-xl font-extrabold text-[#f5a623]">
            {formatVND(priceData.grandTotal)} <span className="text-sm font-semibold">VND</span>
          </span>
        </div>
      </div>

      {/* Summary mini */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-base font-bold text-[#1a2332] mb-4">Tóm tắt đơn hàng</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400 text-xs">Xe</p>
            <p className="font-semibold">{booking.carName}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Thời gian</p>
            <p className="font-semibold">{booking.pickupDate} → {booking.returnDate}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Bảo hiểm</p>
            <p className="font-semibold">{insurance?.name || 'Không bảo hiểm'}</p>
          </div>
          {couponCode && (
            <div>
              <p className="text-gray-400 text-xs">Mã giảm giá</p>
              <p className="font-semibold text-green-600">{couponCode}</p>
            </div>
          )}
        </div>
      </div>

      {/* Terms & conditions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-base font-bold text-[#1a2332] mb-4">Xác nhận điều khoản</h3>

        <div className="space-y-4">
          <label className="custom-checkbox">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
            />
            <span className="checkbox-mark">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <span className="text-sm text-gray-700">
              Tôi chấp nhận và đồng ý với các <a href="#" className="text-[#f5a623] font-semibold hover:underline">điều khoản và nghĩa vụ</a> của các bên trong hợp đồng.
            </span>
          </label>

          <label className="custom-checkbox">
            <input
              type="checkbox"
              checked={agreedPolicy}
              onChange={(e) => setAgreedPolicy(e.target.checked)}
            />
            <span className="checkbox-mark">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <span className="text-sm text-gray-700">
              <a href="#" className="text-[#f5a623] font-semibold hover:underline">Điều khoản và nghĩa vụ 2 bên</a> <span className="inline-flex items-center justify-center w-4 h-4 bg-gray-200 rounded-full text-[10px] cursor-help" title="Xem chi tiết điều khoản">ⓘ</span>
            </span>
          </label>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-between">
        <button className="btn-secondary" onClick={onBack}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          Quay lại
        </button>
        <button
          className={`btn-primary ${!canSubmit ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleConfirm}
          disabled={!canSubmit}
        >
          {submitting ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Đang xử lý...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Thanh toán
            </>
          )}
        </button>
      </div>
    </div>
  )
}
