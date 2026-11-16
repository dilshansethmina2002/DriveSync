// Top bar: menu button (mobile), page title, data-source badge, user chip
import { Menu, Server, FlaskConical, CalendarDays } from 'lucide-react';
import { USE_MOCK } from '../../config/appConfig';

export default function Navbar({ title, user, onMenuClick }) {
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200/70 bg-white/85 px-4 backdrop-blur-md print:hidden sm:px-6">
      <button onClick={onMenuClick} className="rounded-lg p-2 text-ds-ink hover:bg-slate-100 lg:hidden" aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>

      <p className="truncate text-base font-semibold text-ds-ink">{title}</p>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <span className="hidden items-center gap-1.5 text-xs font-medium text-ds-muted md:flex">
          <CalendarDays className="h-4 w-4" /> {today}
        </span>

        {/* Always show where data comes from - never pretend mock data is real */}
        {USE_MOCK ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-300" title="VITE_USE_MOCK=true">
            <FlaskConical className="h-3.5 w-3.5" /> MOCK DATA
          </span>
        ) : (
          <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 sm:inline-flex" title="Connected through the API Gateway">
            <Server className="h-3.5 w-3.5" /> Live API
          </span>
        )}

        <span className="grid h-9 w-9 place-items-center rounded-full bg-ds-royal text-sm font-bold text-white" title={user?.email || user?.name}>
          {(user?.name || 'U').slice(0, 1).toUpperCase()}
        </span>
      </div>
    </header>
  );
}
