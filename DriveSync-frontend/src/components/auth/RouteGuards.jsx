// =============================================================
//  Route guards
//  <RequireAuth>  -> must be logged in (token from Member 1's login page)
//  <RequireRole roles={['Admin']}> -> must have one of these roles
//  <HomeRedirect> -> "/" sends admins to the dashboard, customers to checkout
// =============================================================
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { getUser, isAdmin, isSessionExpired } from '../../utils/auth';
import { USE_MOCK } from '../../config/appConfig';

export function RequireAuth() {
  const location = useLocation();
  // In mock mode a fake session is allowed so the UI can be explored without the Auth Service
  if (!USE_MOCK && isSessionExpired()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (USE_MOCK && !getUser()) {
    return <Navigate to="/dev-login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

export function RequireRole({ roles }) {
  const user = getUser();
  const allowed = roles.map((r) => r.toLowerCase()).includes(String(user?.role || '').toLowerCase());
  if (allowed) return <Outlet />;

  return (
    <div className="mx-auto mt-10 max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-rose-50 text-rose-600">
        <ShieldAlert className="h-7 w-7" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-ds-ink">Access restricted</h2>
      <p className="mt-1 text-sm text-ds-muted">This page is only available to: {roles.join(', ')}.</p>
      <Link to="/" className="mt-5 inline-block text-sm font-semibold text-ds-link hover:underline">
        Go to my home page
      </Link>
    </div>
  );
}

export function HomeRedirect() {
  return <Navigate to={isAdmin() ? '/payments/dashboard' : '/catalog'} replace />;
}
