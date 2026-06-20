import clsx from 'clsx'

export default function Card({
  children,
  hoverable = false,
  padding = 'md',
  className,
  onClick,
  ...props
}) {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6 md:p-8',
  }

  return (
    <div
      className={clsx(
        'card',
        hoverable && 'card-hover cursor-pointer',
        paddings[padding],
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return (
    <div className={clsx('pb-4 border-b border-ink-100', className)}>
      {children}
    </div>
  )
}

export function CardBody({ children, className }) {
  return <div className={clsx('py-4', className)}>{children}</div>
}

export function CardFooter({ children, className }) {
  return (
    <div className={clsx('pt-4 border-t border-ink-100', className)}>
      {children}
    </div>
  )
}
