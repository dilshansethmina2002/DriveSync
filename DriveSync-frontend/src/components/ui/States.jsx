// Loading, error and empty states used by every page
import { AlertTriangle, Inbox, Loader2, RefreshCw } from 'lucide-react';
import Button from './Button';

export function Spinner({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-3 py-12 text-sm text-ds-muted ${className}`} role="status">
      <Loader2 className="h-5 w-5 animate-spin text-ds-royal" />
      {label}
    </div>
  );
}

export function ErrorState({ message, onRetry, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/60 px-6 py-10 text-center ${className}`} role="alert">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-rose-100 text-rose-600">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <div>
        <p className="font-semibold text-ds-ink">Something went wrong</p>
        <p className="mt-1 max-w-md text-sm text-ds-muted">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ title = 'Nothing here yet', message, icon: Icon = Inbox, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-ds-surface text-ds-muted">
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <p className="font-semibold text-ds-ink">{title}</p>
        {message && <p className="mt-1 max-w-sm text-sm text-ds-muted">{message}</p>}
      </div>
      {action}
    </div>
  );
}
