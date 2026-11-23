// Reusable button with variants, sizes, icon and loading spinner
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-ds-royal text-white hover:bg-ds-medium shadow-sm shadow-ds-royal/25 focus-visible:ring-ds-royal/40',
  dark: 'bg-ds-navy text-white hover:bg-ds-deep focus-visible:ring-ds-navy/40',
  secondary: 'bg-white text-ds-ink border border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus-visible:ring-slate-300',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500/40',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500/40',
  warning: 'bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-400/40',
  ghost: 'text-ds-muted hover:text-ds-ink hover:bg-slate-100 focus-visible:ring-slate-300',
  link: 'text-ds-link hover:underline px-0! py-0! h-auto!',
};

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2 rounded-xl',
  icon: 'h-9 w-9 justify-center rounded-lg',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-4 active:scale-[0.98] disabled:opacity-55 disabled:cursor-not-allowed disabled:active:scale-100 whitespace-nowrap ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon && <Icon className="h-4 w-4 shrink-0" />}
      {children}
    </button>
  );
}
