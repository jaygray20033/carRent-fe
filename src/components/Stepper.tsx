import type { CheckoutStep } from '../utils/types'

interface StepperProps {
  currentStep: CheckoutStep
}

const steps = [
  { step: 1, label: 'Chọn xe', icon: '🚗' },
  { step: 2, label: 'Chọn bảo hiểm', icon: '🛡️' },
  { step: 3, label: 'Xác nhận thông tin', icon: '📋' },
  { step: 4, label: 'Thanh toán', icon: '💳' },
] as const

export default function Stepper({ currentStep }: StepperProps) {
  return (
    <div className="stepper">
      {steps.map(({ step, label, icon }, index) => {
        const status = step < currentStep ? 'completed' : step === currentStep ? 'active' : ''
        return (
          <div key={step} className={`stepper-step ${status}`}>
            {/* Line connector */}
            {index > 0 && (
              <div
                className="absolute top-[22px] right-[calc(50%+24px)] h-[3px] z-0"
                style={{
                  width: 'calc(100% - 48px)',
                  background: step <= currentStep ? '#f5a623' : '#e2e8f0',
                }}
              />
            )}
            <div className="stepper-icon">
              {step < currentStep ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-base">{icon}</span>
              )}
            </div>
            <span className="stepper-label">{label}</span>
          </div>
        )
      })}
    </div>
  )
}
