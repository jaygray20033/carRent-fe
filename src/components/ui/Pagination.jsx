import clsx from 'clsx'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className,
}) {
  const getPages = () => {
    const pages = []
    const delta = 1

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...')
      }
    }
    return pages
  }

  if (totalPages <= 1) return null

  return (
    <nav
      className={clsx('flex items-center justify-center gap-1', className)}
      aria-label="Pagination"
    >
      <button
        onClick={() => onPageChange?.(currentPage - 1)}
        disabled={currentPage <= 1}
        className="p-2 rounded-lg text-ink-500 hover:bg-ink-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>

      {getPages().map((page, i) =>
        page === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-ink-300">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange?.(page)}
            className={clsx(
              'min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors',
              page === currentPage
                ? 'bg-brand-primary text-white'
                : 'text-ink-500 hover:bg-ink-50'
            )}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange?.(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-2 rounded-lg text-ink-500 hover:bg-ink-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </nav>
  )
}
