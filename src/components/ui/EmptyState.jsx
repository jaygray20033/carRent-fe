import clsx from 'clsx'
import { InboxIcon } from '@heroicons/react/24/outline'
import Button from './Button'

export default function EmptyState({
  icon: Icon = InboxIcon,
  title = 'Không có dữ liệu',
  description,
  action,
  actionLabel,
  className,
}) {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      <div className="w-16 h-16 rounded-full bg-ink-50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-ink-300" />
      </div>
      <h3 className="text-lg font-semibold text-ink-700 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-ink-300 max-w-sm mb-4">{description}</p>
      )}
      {action && actionLabel && (
        <Button variant="primary" size="sm" onClick={action}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
