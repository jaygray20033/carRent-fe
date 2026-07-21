import { BookingInfo, InsurancePackage } from './types'

export const mockBookingInfo: BookingInfo = {
  pickupLocation: '36 Xuân La',
  returnLocation: '36 Xuân La',
  pickupDate: '24-03-2026',
  pickupTime: '07:00',
  returnDate: '27-03-2026',
  returnTime: '07:00',
  carName: 'Mercedes-Benz S500',
  carImage: '',
  carType: 'Sedan hạng sang',
  pricePerDay: 25_500_000,
  deliveryType: 'delivery',
  deliveryFee: 585_000,
}

export const insurancePackages: InsurancePackage[] = [
  {
    id: 'none',
    name: 'Không bảo hiểm',
    price: 0,
    priceLabel: '0',
    benefits: ['Không có bảo hiểm bổ sung', 'Khách hàng tự chịu trách nhiệm toàn bộ'],
  },
  {
    id: 'basic',
    name: 'Gói Cơ Bản',
    price: 150_000,
    priceLabel: '150.000/ngày',
    benefits: [
      'Bảo hiểm tai nạn cá nhân',
      'Hỗ trợ cứu hộ 24/7',
      'Bồi thường tối đa 50 triệu VND',
    ],
  },
  {
    id: 'standard',
    name: 'Gói Tiêu Chuẩn',
    price: 300_000,
    priceLabel: '300.000/ngày',
    recommended: true,
    benefits: [
      'Bảo hiểm tai nạn cá nhân',
      'Hỗ trợ cứu hộ 24/7',
      'Bồi thường tối đa 200 triệu VND',
      'Miễn thường 50% thiệt hại xe',
      'Bảo hiểm hành lý cá nhân',
    ],
  },
  {
    id: 'premium',
    name: 'Gói Cao Cấp',
    price: 500_000,
    priceLabel: '500.000/ngày',
    benefits: [
      'Bảo hiểm toàn diện',
      'Hỗ trợ cứu hộ 24/7 VIP',
      'Bồi thường không giới hạn',
      'Miễn thường 100% thiệt hại xe',
      'Bảo hiểm hành lý cá nhân',
      'Xe thay thế trong thời gian sửa chữa',
      'Bảo hiểm bên thứ ba',
    ],
  },
]

export const validCoupons: Record<string, { discountPercent: number; maxDiscount: number }> = {
  OTORENT10: { discountPercent: 10, maxDiscount: 5_000_000 },
  NEWUSER: { discountPercent: 15, maxDiscount: 3_000_000 },
  SUMMER2026: { discountPercent: 5, maxDiscount: 2_000_000 },
  VIP20: { discountPercent: 20, maxDiscount: 10_000_000 },
}
