import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, LayoutDashboard, LogOut } from 'lucide-react';
import { getUser, isAdmin, isSessionExpired, logout } from '../../utils/auth';

export default function PublicLayout({ children }) {
  const navigate = useNavigate();
  const user = getUser();
  const loggedIn = user && !isSessionExpired();
  const admin = isAdmin(user);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-ds-surface font-sans">
      {/* Public Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
              <img src="/drivesync_logo.png" alt="DriveSync" className="h-7 w-7 object-contain" />
            </span>
            <span className="text-xl font-extrabold tracking-tight text-ds-navy">
              Drive<span className="text-ds-cyan">Sync</span>
            </span>
          </Link>

          {/* Center Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-ds-ink">
            <a href="#vehicles" className="hover:text-ds-royal transition-colors">
              Vehicles
            </a>
            <a href="#packages" className="hover:text-ds-royal transition-colors">
              Rental Packages
            </a>
            <a href="#how-it-works" className="hover:text-ds-royal transition-colors">
              How It Works
            </a>
          </nav>

          {/* Auth / Account Actions */}
          <div className="flex items-center gap-2.5">
            {loggedIn ? (
              <>
                <Link
                  to={admin ? '/payments/dashboard' : '/bookings'}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-ds-royal px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-ds-medium transition"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {admin ? 'Admin Panel' : 'My Account'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-ds-ink hover:bg-slate-50 transition cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-ds-ink hover:bg-slate-50 transition"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-ds-navy px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-ds-deep transition"
                >
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children || <Outlet />}</main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-ds-muted">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-semibold text-ds-ink">
            Drive<span className="text-ds-cyan">Sync</span> &mdash; Vehicle Rental & Fleet Management System
          </p>
          <p>&copy; {new Date().getFullYear()} DriveSync. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
