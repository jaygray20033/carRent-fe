import clsx from 'clsx'

export default function Skeleton({ className, variant = 'rect', width, height }) {
  const variants = {
    rect: 'rounded-lg',
    circle: 'rounded-full',
    text: 'rounded h-4',
  }

  return (
    <div
      className={clsx(
        'animate-pulse bg-ink-100',
        variants[variant],
        className
      )}
      style={{ width, height }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="card p-4 space-y-3">
      <Skeleton className="w-full h-40" />
      <Skeleton variant="text" className="w-3/4" />
      <Skeleton variant="text" className="w-1/2" />
      <div className="flex gap-2 pt-2">
        <Skeleton variant="text" className="w-20" />
        <Skeleton variant="text" className="w-20" />
      </div>
    </div>
  )
}
