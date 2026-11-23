// Dashboard number tile: icon + label + big value + small hint
import Skeleton from './Skeleton';

const TONES = {
  blue: 'bg-ds-royal/10 text-ds-royal',
  cyan: 'bg-ds-cyan/15 text-sky-700',
  green: 'bg-emerald-50 text-emerald-600',
  orange: 'bg-amber-50 text-amber-600',
  red: 'bg-rose-50 text-rose-600',
  purple: 'bg-violet-50 text-violet-600',
  slate: 'bg-slate-100 text-slate-600',
};

export default function StatCard({ label, value, hint, icon: Icon, tone = 'blue', loading = false, onClick }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className={`group text-left bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(20,38,84,0.06)] transition ${onClick ? 'hover:-translate-y-0.5 hover:shadow-md cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-ds-muted">{label}</p>
        {Icon && (
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${TONES[tone]}`}>
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-28" />
      ) : (
        <p className="mt-1 text-2xl font-bold tracking-tight text-ds-ink tabular-nums">{value}</p>
      )}
      {hint && <p className="mt-1.5 text-xs text-ds-muted">{hint}</p>}
    </Tag>
  );
}
