import React from 'react'

export default function PaginationFooter({
  currentPage,
  totalPages,
  onPageChange,
  summaryText
}) {
  const getPaginationItems = () => {
    const safeTotal = Math.max(1, totalPages || 1)
    if (safeTotal <= 5) {
      return Array.from({ length: safeTotal }, (_, i) => i + 1)
    }

    const pages = new Set([1, safeTotal, currentPage])

    if (currentPage > 1) pages.add(currentPage - 1)
    if (currentPage < safeTotal) pages.add(currentPage + 1)

    if (currentPage <= 3) {
      pages.add(2)
      pages.add(3)
    }

    if (currentPage >= safeTotal - 2) {
      pages.add(safeTotal - 1)
      pages.add(safeTotal - 2)
    }

    const sortedPages = Array.from(pages).sort((a, b) => a - b)
    const result = []

    for (let i = 0; i < sortedPages.length; i++) {
      if (i > 0 && sortedPages[i] - sortedPages[i - 1] > 1) {
        result.push('...')
      }
      result.push(sortedPages[i])
    }

    return result
  }

  const items = getPaginationItems()

  return (
    <div className="table-footer">
      <div>{summaryText}</div>
      <div className="pagination">
        <button
          className="page-btn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        >
          &lt;
        </button>
        {items.map((item, idx) => {
          if (item === '...') {
            return (
              <span key={`ellipsis-${idx}`} style={{ padding: '0 4px', color: 'var(--color-neutral-400)' }}>
                ...
              </span>
            )
          }
          return (
            <button
              key={item}
              className={`page-btn ${currentPage === item ? 'active' : ''}`}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          )
        })}
        <button
          className="page-btn"
          disabled={currentPage >= (totalPages || 1)}
          onClick={() => onPageChange(Math.min(totalPages || 1, currentPage + 1))}
        >
          &gt;
        </button>
      </div>
    </div>
  )
}
