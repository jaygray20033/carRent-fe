import { forwardRef } from 'react'
import clsx from 'clsx'

const Radio = forwardRef(({ label, className, id, ...props }, ref) => {
  const radioId = id || `radio-${label?.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className="flex items-center gap-3">
      <input
        ref={ref}
        type="radio"
        id={radioId}
        className={clsx(
          'h-4 w-4 border-ink-300 text-brand-primary',
          'focus:ring-2 focus:ring-brand-primary-light focus:ring-offset-0',
          'cursor-pointer transition-colors',
          className
        )}
        {...props}
      />
      {label && (
        <label htmlFor={radioId} className="text-sm font-medium text-ink-700 cursor-pointer">
          {label}
        </label>
      )}
    </div>
  )
})

Radio.displayName = 'Radio'
export default Radio
