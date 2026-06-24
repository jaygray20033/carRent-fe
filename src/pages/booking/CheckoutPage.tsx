import { useState, useMemo, useCallback } from 'react'
import Stepper from '../../components/Stepper'
import PriceBreakdown from '../../components/PriceBreakdown'
import Step1Summary from '../../components/steps/Step1Summary'
import Step2Insurance from '../../components/steps/Step2Insurance'
import Step3Coupon from '../../components/steps/Step3Coupon'
import Step4Confirm from '../../components/steps/Step4Confirm'
import { mockBookingInfo, insurancePackages } from '../../utils/mockData'
import { calcRentalDays } from '../../utils/format'
import type { CheckoutStep, CouponResult, PriceBreakdownData } from '../../utils/types'

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1)
  const [selectedInsuranceId, setSelectedInsuranceId] = useState('standard')
  const [couponCode, setCouponCode] = useState('')
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null)

  const booking = mockBookingInfo
  const rentalDays = calcRentalDays(booking.pickupDate, booking.returnDate)

  const selectedInsurance = useMemo(
    () => insurancePackages.find((p) => p.id === selectedInsuranceId),
    [selectedInsuranceId],
  )

  // Calculate price breakdown - updates in realtime
  const priceData: PriceBreakdownData = useMemo(() => {
    const dailyRate = booking.pricePerDay
    const rentalSubtotal = dailyRate * rentalDays
    const deliveryPickup = booking.deliveryFee
    const deliveryReturn = booking.deliveryFee
    const insuranceCost = (selectedInsurance?.price || 0) * rentalDays
    const subtotalBeforeTax = rentalSubtotal + deliveryPickup + deliveryReturn + insuranceCost
    const tax = Math.round(subtotalBeforeTax * 0.05)
    const totalRentalCost = subtotalBeforeTax + tax

    const insuranceDeposit = 100_000_000
    const fixedDeposit = 100_000_000
    const trafficViolationDeposit = 0
    const totalDeposit = insuranceDeposit + fixedDeposit + trafficViolationDeposit

    const couponDiscount = couponResult?.valid ? couponResult.discountAmount : 0

    const grandTotal = totalRentalCost + totalDeposit - couponDiscount

    return {
      rentalDays,
      dailyRate,
      rentalSubtotal,
      deliveryPickup,
      deliveryReturn,
      tax,
      totalRentalCost,
      insuranceDeposit,
      fixedDeposit,
      trafficViolationDeposit,
      totalDeposit,
      couponDiscount,
      grandTotal,
    }
  }, [booking, rentalDays, selectedInsurance, couponResult])

  const goNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 4) as CheckoutStep)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const goBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as CheckoutStep)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleApplyCoupon = useCallback((result: CouponResult, code: string) => {
    setCouponResult(result)
    setCouponCode(code)
  }, [])

  const handleRemoveCoupon = useCallback(() => {
    setCouponResult(null)
    setCouponCode('')
  }, [])

  const handleConfirm = useCallback(() => {
    // Simulate booking creation → redirect to payment
    console.log('Booking created!', { booking, selectedInsuranceId, couponCode, priceData })
  }, [booking, selectedInsuranceId, couponCode, priceData])

  return (
    <>
      {/* Hero banner */}
      <div className="relative bg-[#1a2332] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=80')`,
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Thanh toán</h1>
          <p className="text-gray-300 text-sm">
            <span className="text-[#f5a623]">OtoRent</span> &rsaquo; Đăng ký yêu cầu đặt xe
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-2">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-2">
          <Stepper currentStep={currentStep} />
        </div>
      </div>

      {/* Main content + sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content area */}
          <div className="flex-1 min-w-0">
            {currentStep === 1 && (
              <Step1Summary booking={booking} onNext={goNext} />
            )}
            {currentStep === 2 && (
              <Step2Insurance
                packages={insurancePackages}
                selectedId={selectedInsuranceId}
                onSelect={setSelectedInsuranceId}
                onBack={goBack}
                onNext={goNext}
              />
            )}
            {currentStep === 3 && (
              <Step3Coupon
                priceData={priceData}
                couponCode={couponCode}
                couponResult={couponResult}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
                onBack={goBack}
                onNext={goNext}
              />
            )}
            {currentStep === 4 && (
              <Step4Confirm
                booking={booking}
                insurance={selectedInsurance}
                priceData={priceData}
                couponCode={couponCode}
                onBack={goBack}
                onConfirm={handleConfirm}
              />
            )}
          </div>

          {/* Sticky sidebar */}
          <aside className="w-full lg:w-[380px] flex-shrink-0">
            <PriceBreakdown
              data={priceData}
              couponApplied={couponResult?.valid === true}
              couponCode={couponCode}
            />
          </aside>
        </div>
      </div>
    </>
  )
}
