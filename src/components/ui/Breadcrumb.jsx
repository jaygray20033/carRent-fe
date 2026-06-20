import clsx from 'clsx'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid'

export default function Breadcrumb({ items = [], className }) {
  return (
    <nav className={clsx('flex items-center gap-1 text-sm', className)} aria-label="Breadcrumb">
      <a href="/" className="text-ink-300 hover:text-brand-primary transition-colors">
        <HomeIcon className="w-4 h-4" />
      </a>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRightIcon className="w-4 h-4 text-ink-300" />
          {item.href && i < items.length - 1 ? (
            <a
              href={item.href}
              className="text-ink-300 hover:text-brand-primary transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-ink-700 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
