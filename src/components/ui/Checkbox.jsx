import { forwardRef } from 'react'
import clsx from 'clsx'

const Checkbox = forwardRef(
  ({ label, description, error, className, id, ...props }, ref) => {
    const checkId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          type="checkbox"
          id={checkId}
          className={clsx(
            'mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-primary',
            'focus:ring-2 focus:ring-brand-primary-light focus:ring-offset-0',
            'cursor-pointer transition-colors',
            error && 'border-danger',
            className
          )}
          {...props}
        />
        {(label || description) && (
          <div>
            {label && (
              <label htmlFor={checkId} className="text-sm font-medium text-ink-700 cursor-pointer">
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-ink-300 mt-0.5">{description}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'
export default Checkbox
