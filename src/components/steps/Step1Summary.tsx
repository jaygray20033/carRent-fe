import type { BookingInfo } from '../../utils/types'
import { formatVND } from '../../utils/format'

interface Step1Props {
  booking: BookingInfo
  onNext: () => void
}

export default function Step1Summary({ booking, onNext }: Step1Props) {
  return (
    <div className="animate-slide-in">
      {/* Section title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#1a2332] rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-[#f5a623]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1a2332]">Thông tin đặt xe</h2>
          <p className="text-sm text-gray-500">Kiểm tra lại thông tin trước khi tiếp tục</p>
        </div>
      </div>

      {/* Booking details card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Car info header */}
        <div className="bg-gradient-to-r from-[#1a2332] to-[#2a3a52] p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#f5a623] text-sm font-medium mb-1">{booking.carType}</p>
              <h3 className="text-2xl font-bold">{booking.carName}</h3>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs">Giá thuê / ngày</p>
              <p className="text-[#f5a623] text-xl font-bold">{formatVND(booking.pricePerDay)} <span className="text-sm">VND</span></p>
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoItem
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              label="Địa điểm nhận xe"
              value={booking.pickupLocation}
            />
            <InfoItem
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              label="Ngày trả xe"
              value={booking.returnDate}
            />
            <InfoItem
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              }
              label="Xe"
              value={booking.carName}
            />
            <InfoItem
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              label="Địa điểm trả xe"
              value={booking.returnLocation}
            />
            <InfoItem
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              label="Giờ trả xe"
              value={booking.returnTime}
            />
            <InfoItem
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              label="Số tiền đặt cọc"
              value="Theo quy định"
            />
          </div>

          {/* Pickup info row */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InfoItem
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              label="Ngày nhận xe"
              value={booking.pickupDate}
            />
            <InfoItem
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              label="Giờ nhận xe"
              value={booking.pickupTime}
            />
            <InfoItem
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              label="Hình thức nhận xe"
              value={booking.deliveryType === 'delivery' ? 'Giao xe tận nơi' : 'Nhận tại cửa hàng'}
            />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end mt-6">
        <button className="btn-primary" onClick={onNext}>
          Tiếp tục chọn bảo hiểm
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-[#1a2332] flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-[#1a2332] mt-0.5">{value}</p>
      </div>
    </div>
  )
}
