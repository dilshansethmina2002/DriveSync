// =============================================================
//  DEVELOPER SIGN-IN (only available while running "npm run dev")
//  Lets Member 3 test the pages before the Auth Service is ready:
//   - Paste a token made with  "npm run token -- Admin"  (real backend)
//   - Or pick a role in mock mode (no backend at all)
//  For the final demo use the real /login page (Member 1).
// =============================================================
import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { KeyRound, ShieldCheck, User, FlaskConical } from 'lucide-react';
import Button from '../components/ui/Button';
import { Textarea } from '../components/ui/FormField';
import { decodeToken } from '../utils/auth';
import { USE_MOCK } from '../config/appConfig';
import { MOCK_CUSTOMER_ID } from '../api/mock/mockData';

export default function DevLogin() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const goNext = () => navigate(location.state?.from || '/', { replace: true });

  const saveSession = (jwt, user) => {
    localStorage.setItem('token', jwt);
    localStorage.setItem('user', JSON.stringify(user));
    toast.success(`Signed in as ${user.role}`);
    goNext();
  };

  const signInWithToken = () => {
    const payload = decodeToken(token.trim());
    const user = payload?.user || payload;
    if (!user?.id) return setError('This does not look like a DriveSync JWT. Generate one with: npm run token -- Admin');
    if (payload.exp && payload.exp * 1000 < Date.now()) return setError('This token has expired. Generate a new one.');
    saveSession(token.trim(), { id: user.id, role: user.role || 'Customer', name: `Test ${user.role || 'Customer'}`, email: 'test@drivesync.local' });
  };

  const signInAsRole = (role) =>
    saveSession('mock-token', {
      id: role === 'Admin' ? '6650a1b2c3d4e5f6000000ad' : MOCK_CUSTOMER_ID,
      role,
      name: role === 'Admin' ? 'Nimal Perera (Admin)' : 'Kasun Silva',
      email: role === 'Admin' ? 'admin@drivesync.lk' : 'kasun@example.com',
    });

  if (!import.meta.env.DEV && !USE_MOCK) {
    return <p className="p-8 text-center text-sm">Developer sign-in is disabled in production. Please use the normal login.</p>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-ds-royal to-ds-deep p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-ds-royal/10 text-ds-royal">
            <KeyRound className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-ds-ink">Developer sign-in</h1>
            <p className="text-xs text-ds-muted">For testing Member 3 pages only. Not part of the final product.</p>
          </div>
        </div>

        {USE_MOCK ? (
          <div className="mt-6 space-y-3">
            <p className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs font-medium text-amber-800">
              <FlaskConical className="h-4 w-4 shrink-0" /> Mock mode is ON: pick a role to explore with sample data.
            </p>
            <Button className="w-full" size="lg" icon={ShieldCheck} onClick={() => signInAsRole('Admin')}>
              Continue as Admin
            </Button>
            <Button className="w-full" size="lg" variant="secondary" icon={User} onClick={() => signInAsRole('Customer')}>
              Continue as Customer
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <Textarea
              label="Paste a test JWT"
              name="token"
              rows={5}
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                setError('');
              }}
              error={error}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              hint='In payment-service run:  npm run token -- Admin   (or  -- Customer <24-char id>)'
            />
            <Button className="w-full" size="lg" onClick={signInWithToken} disabled={!token.trim()}>
              Sign in with token
            </Button>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-ds-muted">
          Have a real account?{' '}
          <Link to="/login" className="font-semibold text-ds-link hover:underline">
            Use the normal login
          </Link>
        </p>
      </div>
    </div>
  );
}
