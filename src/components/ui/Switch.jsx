import { Switch as HeadlessSwitch } from '@headlessui/react'
import clsx from 'clsx'

export default function Switch({ enabled, onChange, label, size = 'md' }) {
  const sizes = {
    sm: { track: 'h-5 w-9', thumb: 'h-3.5 w-3.5', translate: 'translate-x-4' },
    md: { track: 'h-6 w-11', thumb: 'h-4 w-4', translate: 'translate-x-5' },
    lg: { track: 'h-7 w-14', thumb: 'h-5 w-5', translate: 'translate-x-7' },
  }
  const s = sizes[size]

  return (
    <div className="flex items-center gap-3">
      <HeadlessSwitch
        checked={enabled}
        onChange={onChange}
        className={clsx(
          'relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-light focus-visible:ring-offset-2',
          s.track,
          enabled ? 'bg-brand-primary' : 'bg-ink-300'
        )}
      >
        <span
          aria-hidden="true"
          className={clsx(
            'pointer-events-none inline-block rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
            s.thumb,
            'translate-y-[3px] translate-x-[3px]',
            enabled && s.translate
          )}
        />
      </HeadlessSwitch>
      {label && <span className="text-sm font-medium text-ink-700">{label}</span>}
    </div>
  )
}
