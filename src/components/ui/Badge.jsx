import clsx from 'clsx'

const variantStyles = {
  primary: 'bg-brand-primary/10 text-brand-primary',
  accent: 'bg-brand-accent/20 text-brand-accent-dark',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  info: 'bg-info/10 text-info',
  neutral: 'bg-ink-100 text-ink-700',
}

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1 text-sm',
}

export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  className,
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-semibold rounded-full whitespace-nowrap',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={clsx('w-1.5 h-1.5 rounded-full', {
            'bg-brand-primary': variant === 'primary',
            'bg-brand-accent-dark': variant === 'accent',
            'bg-success': variant === 'success',
            'bg-warning': variant === 'warning',
            'bg-danger': variant === 'danger',
            'bg-info': variant === 'info',
            'bg-ink-500': variant === 'neutral',
          })}
        />
      )}
      {children}
    </span>
  )
}
