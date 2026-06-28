import { forwardRef } from 'react'
import clsx from 'clsx'
import { InputError } from './Input'

const Textarea = forwardRef(
  ({ label, error, helperText, className, id, rows = 4, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-ink-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={clsx(
            'input resize-y',
            error && 'input-error',
            className
          )}
          {...props}
        />
        {error && <InputError message={error} />}
        {!error && helperText && (
          <p className="mt-1 text-xs text-ink-300">{helperText}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
export default Textarea
