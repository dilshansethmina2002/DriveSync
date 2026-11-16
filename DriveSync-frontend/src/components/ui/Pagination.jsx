// Pagination bar - works with the backend's pagination object:
// { page, limit, total, totalPages, hasNextPage, hasPrevPage }
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.total === 0) return null;
  const { page, limit, total, totalPages } = pagination;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  // Show at most 5 page numbers around the current page
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i);

  const btn = 'grid h-8 min-w-8 place-items-center rounded-lg px-2 text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5 sm:flex-row">
      <p className="text-xs text-ds-muted">
        Showing <span className="font-semibold text-ds-ink">{from}</span>–<span className="font-semibold text-ds-ink">{to}</span> of{' '}
        <span className="font-semibold text-ds-ink">{total}</span>
      </p>
      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button className={`${btn} text-ds-muted hover:bg-slate-100`} disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`${btn} ${p === page ? 'bg-ds-royal text-white shadow-sm' : 'text-ds-ink hover:bg-slate-100'}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ))}
        <button className={`${btn} text-ds-muted hover:bg-slate-100`} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
}
