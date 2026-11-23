// =============================================================
//  Dark navy sidebar
//  - Desktop (lg+): always visible on the left
//  - Tablet/mobile: slides in from the left when the menu button is pressed
// =============================================================
import { NavLink } from 'react-router-dom';
import { LogOut, X, ShieldCheck } from 'lucide-react';
import { NAV_SECTIONS } from './navigation';
import { isAdmin } from '../../utils/auth';

const canSee = (roles, admin) => !roles || roles.includes(admin ? 'Admin' : 'Customer');

export default function Sidebar({ user, open, onClose, onLogout }) {
  const admin = isAdmin(user);

  return (
    <>
      {/* Dark overlay behind the sidebar on small screens */}
      <div className={`fixed inset-0 z-30 bg-ds-navy/50 transition-opacity lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick={onClose} />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-68 flex-col overflow-hidden bg-gradient-to-b from-ds-navy via-ds-navy to-ds-deep text-white transition-transform duration-200 print:hidden lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Decorative circles (same idea as the login page) */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-ds-royal/25" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-ds-steel/15" />

        {/* Logo */}
        <div className="relative flex h-18 items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-white shadow-lg">
              <img src="/drivesync_logo.png" alt="DriveSync logo" className="h-8 w-8 object-contain" />
            </span>
            <div className="leading-tight">
              <p className="text-lg font-extrabold tracking-tight">
                Drive<span className="text-ds-cyan">Sync</span>
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Finance & Operations</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Menu */}
        <nav className="relative flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {NAV_SECTIONS.filter((s) => canSee(s.roles, admin)).map((section) => (
            <div key={section.title}>
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">{section.title}</p>
              <ul className="space-y-1">
                {section.items
                  .filter((item) => canSee(item.roles, admin))
                  .map(({ to, label, customerLabel, icon: Icon }) => (
                    <li key={to}>
                      <NavLink
                        to={to}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                            isActive ? 'bg-white/12 text-white shadow-inner' : 'text-white/65 hover:bg-white/6 hover:text-white'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-ds-cyan" />}
                            <Icon className={`h-[18px] w-[18px] ${isActive ? 'text-ds-cyan' : ''}`} />
                            {!admin && customerLabel ? customerLabel : label}
                          </>
                        )}
                      </NavLink>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Signed-in user */}
        <div className="relative m-3 rounded-2xl border border-white/10 bg-white/8 p-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-ds-cyan to-ds-royal text-sm font-bold">
              {(user?.name || user?.role || 'U').slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user?.name || 'Signed in'}</p>
              <p className="flex items-center gap-1 text-xs text-white/55">
                {admin && <ShieldCheck className="h-3 w-3 text-ds-cyan" />}
                {user?.role || 'Customer'}
              </p>
            </div>
            <button onClick={onLogout} className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white" aria-label="Sign out" title="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
