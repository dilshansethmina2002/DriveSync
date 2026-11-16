// =============================================================
//  Reusable table
//  columns = [{ key, header, render?: (row) => JSX, className?, align? }]
//  Handles loading skeleton rows, error and empty states.
//  On small screens the table scrolls sideways instead of breaking the page.
// =============================================================
import Skeleton from './Skeleton';
import { EmptyState, ErrorState } from './States';

export default function DataTable({ columns, rows, loading, error, onRetry, rowKey = '_id', emptyTitle, emptyMessage, emptyAction, onRowClick }) {
  if (error) return <ErrorState message={error} onRetry={onRetry} className="m-5" />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-y border-slate-100 bg-ds-surface/70 text-left">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ds-muted whitespace-nowrap ${col.align === 'right' ? 'text-right' : ''} ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading &&
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={`skeleton-${i}`}>
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-4">
                    <Skeleton className="h-4 w-full max-w-[140px]" />
                  </td>
                ))}
              </tr>
            ))}

          {!loading &&
            rows?.map((row, index) => (
              <tr
                key={row[rowKey] ?? index}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`transition-colors hover:bg-ds-surface/60 ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-5 py-3.5 text-ds-ink align-middle whitespace-nowrap ${col.align === 'right' ? 'text-right' : ''} ${col.className || ''}`}>
                    {col.render ? col.render(row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>

      {!loading && rows?.length === 0 && <EmptyState title={emptyTitle} message={emptyMessage} action={emptyAction} />}
    </div>
  );
}
