import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogIn, UserPlus, LayoutDashboard, LogOut } from 'lucide-react';
import { getUser, isAdmin, isSessionExpired, logout } from '../../utils/auth';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Vehicles', to: '/vehicles' },
  { label: 'Packages', to: '/packages' },
  { label: 'Contact Us', to: '/contact' },
];

export default function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const user = getUser();
  const loggedIn = user && !isSessionExpired();
  const admin = isAdmin(user);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#040B1A]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 group shrink-0"
        >
          <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-white/20 group-hover:ring-[#00E5FF]/60 transition">
            <img
              src="/drivesync_logo.png"
              alt="DriveSync Logo"
              className="h-8 w-8 object-contain"
            />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-white">
            Drive
            <span className="bg-gradient-to-r from-[#00B4D8] to-[#00E5FF] bg-clip-text text-transparent">
              Sync
            </span>
          </span>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-1"
          onMouseLeave={() => setHoveredPath(null)}
        >
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.to;
            const isHighlighted = hoveredPath ? hoveredPath === link.to : isActive;

            return (
              <Link
                key={link.to}
                to={link.to}
                onMouseEnter={() => setHoveredPath(link.to)}
                className={`relative px-4 py-2 text-sm font-semibold transition-colors duration-200 rounded-xl ${
                  isActive
                    ? 'text-[#00E5FF]'
                    : 'text-slate-300 hover:text-[#00E5FF]'
                }`}
              >
                {isHighlighted && (
                  <motion.span
                    layoutId="navbar-active-pill"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className="absolute inset-0 rounded-xl bg-[#00E5FF]/10 -z-10"
                  />
                )}
                {link.label}
                {isActive && (
                  <motion.span
                    layoutId="navbar-active-underline"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-[#00B4D8] to-[#00E5FF]"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {loggedIn ? (
            <>
              <Link
                to={admin ? '/payments/dashboard' : '/bookings'}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#00B4D8] to-[#00E5FF] px-4 py-2 text-sm font-bold text-[#0A1F44] shadow-[0_0_20px_rgba(0,229,255,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(0,229,255,0.45)]"
              >
                <LayoutDashboard className="h-4 w-4" />
                {admin ? 'Admin Panel' : 'My Account'}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 px-3.5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:border-[#00E5FF] hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:border-[#00E5FF] hover:text-[#00E5FF] hover:bg-[#00E5FF]/10"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#00B4D8] to-[#00E5FF] px-4.5 py-2 text-sm font-bold text-[#0A1F44] shadow-[0_0_20px_rgba(0,229,255,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(0,229,255,0.45)]"
              >
                <UserPlus className="h-4 w-4" />
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="md:hidden inline-flex items-center justify-center rounded-xl p-2 text-white hover:bg-[#00E5FF]/15 hover:text-[#00E5FF] transition cursor-pointer"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Slide-Down Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden border-t border-white/10 bg-[#06132B]/95 backdrop-blur-md"
          >
            <div className="px-4 py-4 space-y-2">
              {NAV_LINKS.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`block rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-[#00E5FF]/15 text-[#00E5FF]'
                        : 'text-slate-200 hover:bg-white/10 hover:text-[#00E5FF]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="pt-3 mt-3 border-t border-white/10 flex flex-col gap-2.5">
                {loggedIn ? (
                  <>
                    <Link
                      to={admin ? '/payments/dashboard' : '/bookings'}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00B4D8] to-[#00E5FF] px-4 py-2.5 text-sm font-bold text-[#0A1F44]"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {admin ? 'Admin Panel' : 'My Account'}
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white hover:border-[#00E5FF] hover:text-[#00E5FF]"
                    >
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00B4D8] to-[#00E5FF] px-4 py-2.5 text-sm font-bold text-[#0A1F44]"
                    >
                      <UserPlus className="h-4 w-4" />
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
