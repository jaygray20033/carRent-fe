export interface BookingInfo {
  pickupLocation: string
  returnLocation: string
  pickupDate: string
  pickupTime: string
  returnDate: string
  returnTime: string
  carName: string
  carImage: string
  carType: string
  pricePerDay: number
  deliveryType: 'self' | 'delivery'
  deliveryFee: number
}

export interface InsurancePackage {
  id: string
  name: string
  price: number
  priceLabel: string
  benefits: string[]
  recommended?: boolean
}

export interface CouponResult {
  valid: boolean
  code: string
  discountAmount: number
  discountPercent: number
  message: string
}

export interface PriceBreakdownData {
  rentalDays: number
  dailyRate: number
  rentalSubtotal: number
  deliveryPickup: number
  deliveryReturn: number
  tax: number
  totalRentalCost: number
  insuranceDeposit: number
  fixedDeposit: number
  trafficViolationDeposit: number
  totalDeposit: number
  couponDiscount: number
  grandTotal: number
}

export type CheckoutStep = 1 | 2 | 3 | 4
