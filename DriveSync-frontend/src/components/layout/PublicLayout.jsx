import { Outlet } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-ds-surface font-sans">
      <PublicNavbar />

      {/* Main Content */}
      <main className="flex-1">{children || <Outlet />}</main>

      <PublicFooter />
    </div>
  );
}
