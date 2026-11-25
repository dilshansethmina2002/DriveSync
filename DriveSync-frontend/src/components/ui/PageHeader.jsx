// Page title area: breadcrumb, title, subtitle and action buttons
import { ChevronRight } from 'lucide-react';

export default function PageHeader({ title, subtitle, breadcrumb = [], actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {breadcrumb.length > 0 && (
          <nav className="mb-1.5 flex items-center gap-1 text-xs font-medium text-ds-muted" aria-label="Breadcrumb">
            {breadcrumb.map((item, i) => (
              <span key={item} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                {item}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-ds-ink sm:text-[1.7rem]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ds-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Label / value pair used in detail panels and receipts */
export function DetailRow({ label, children, mono = false }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <dt className="text-ds-muted shrink-0">{label}</dt>
      <dd className={`text-right font-medium text-ds-ink break-all ${mono ? 'font-mono text-xs sm:text-[13px]' : ''}`}>{children ?? '—'}</dd>
    </div>
  );
}
