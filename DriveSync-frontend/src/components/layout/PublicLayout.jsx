import { Outlet } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-ds-surface font-sans">
      <PublicNavbar />

      {/* Main Content */}
      <main className="flex-1">{children || <Outlet />}</main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-ds-muted">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-semibold text-[#0A1F44]">
            Drive<span className="text-[#00B4D8]">Sync</span> &mdash; Vehicle Rental & Fleet Management System
          </p>
          <p>&copy; {new Date().getFullYear()} DriveSync. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
