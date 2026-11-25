// =============================================================
//  Shared dashboard layout: Sidebar + Navbar + page content (<Outlet />)
//  Every Member 3 page is rendered inside this layout (see App.jsx).
// =============================================================
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FlaskConical } from 'lucide-react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { titleForPath } from './navigation';
import { getUser, logout } from '../../utils/auth';
import { USE_MOCK } from '../../config/appConfig';

export default function DashboardLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    toast.success('Signed out');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-ds-surface print:bg-white">
      <Sidebar user={user} open={menuOpen} onClose={() => setMenuOpen(false)} onLogout={handleLogout} />

      <div className="flex min-h-screen flex-col lg:pl-68 print:pl-0">
        {USE_MOCK && (
          <div className="flex items-center justify-center gap-2 bg-amber-400 px-4 py-1.5 text-center text-xs font-semibold text-amber-950 print:hidden">
            <FlaskConical className="h-3.5 w-3.5 shrink-0" />
            Mock mode: showing built-in SAMPLE data, not the real backend. Set VITE_USE_MOCK=false to use the API Gateway.
          </div>
        )}
        <Navbar title={titleForPath(pathname)} user={user} onMenuClick={() => setMenuOpen(true)} />
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 print:p-0">
          <Outlet />
        </main>
        <footer className="px-6 pb-6 text-center text-xs text-ds-muted print:hidden">
          © {new Date().getFullYear()} DriveSync · Finance & Operations module
        </footer>
      </div>
    </div>
  );
}
