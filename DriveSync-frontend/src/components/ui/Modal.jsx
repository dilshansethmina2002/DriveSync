// =============================================================
//  Modal dialog + ConfirmDialog
//  - Closes with Esc or by clicking the dark background
//  - Locks page scrolling while open
// =============================================================
import { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import Button from './Button';

export default function Modal({ open, onClose, title, subtitle, children, footer, size = 'md', closeDisabled = false }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && !closeDisabled && onClose();
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose, closeDisabled]);

  if (!open) return null;
  const width = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ds-navy/50 backdrop-blur-[2px]" onClick={() => !closeDisabled && onClose()} />
      <div className={`ds-animate-in relative flex max-h-[92vh] w-full ${width} flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl`}>
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-ds-ink">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-ds-muted">{subtitle}</p>}
          </div>
          <button onClick={onClose} disabled={closeDisabled} className="rounded-lg p-1.5 text-ds-muted hover:bg-slate-100 hover:text-ds-ink disabled:opacity-40" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && <footer className="flex flex-col-reverse gap-2 border-t border-slate-100 px-6 py-4 sm:flex-row sm:justify-end">{footer}</footer>}
      </div>
    </div>
  );
}

const TONES = {
  danger: { icon: AlertTriangle, iconClass: 'bg-rose-100 text-rose-600', button: 'danger' },
  warning: { icon: AlertTriangle, iconClass: 'bg-amber-100 text-amber-600', button: 'warning' },
  success: { icon: CheckCircle2, iconClass: 'bg-emerald-100 text-emerald-600', button: 'success' },
  info: { icon: Info, iconClass: 'bg-ds-royal/10 text-ds-royal', button: 'primary' },
};

/** "Are you sure?" dialog used before refunds, status changes, payments */
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', tone = 'info', loading = false, children }) {
  const t = TONES[tone];
  const Icon = t.icon;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      closeDisabled={loading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant={t.button} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${t.iconClass}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="text-sm text-ds-muted">
          <div className="leading-relaxed">{message}</div>
          {children}
        </div>
      </div>
    </Modal>
  );
}
