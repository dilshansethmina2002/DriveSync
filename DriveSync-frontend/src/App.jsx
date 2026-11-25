import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthBook from './pages/AuthBook';
import VehicleCatalog from './pages/VehicleCatalog';
import MyBookings from './pages/MyBookings';


// ---- Member 3: Finance & Operations ----
import DashboardLayout from './components/layout/DashboardLayout';
import { RequireAuth, RequireRole, HomeRedirect } from './components/auth/RouteGuards';
import DevLogin from './pages/DevLogin';
import PaymentDashboard from './pages/payments/PaymentDashboard';
import Checkout from './pages/payments/Checkout';
import PaymentHistory from './pages/payments/PaymentHistory';
import PaymentReceipt from './pages/payments/PaymentReceipt';
import RefundManagement from './pages/payments/RefundManagement';
import FleetDashboard from './pages/fleet/FleetDashboard';
import VehicleManagement from './pages/fleet/VehicleManagement';
import MaintenanceManagement from './pages/fleet/MaintenanceManagement';
import VehicleReturns from './pages/fleet/VehicleReturns';

function App() {
  return (
    <>
      {/* Toaster එක මෙහි දැමූ විට මුළු ඇප් එකේම ඕනෑම තැනක toast වැඩ කරයි */}
      <Toaster position="top-right" reverseOrder={false} toastOptions={{ style: { borderRadius: '12px', fontSize: '14px' } }} />

      <Routes>
        <Route path="/login" element={<AuthBook />} />
        <Route path="/register" element={<AuthBook />} />
        <Route path="/dev-login" element={<DevLogin />} />

        {/* ---- Member 3 pages: need a logged-in user, shown inside the dashboard layout ---- */}
        <Route element={<RequireAuth />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<HomeRedirect />} />

            {/* Customers and admins */}
            <Route path="/catalog" element={<VehicleCatalog />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/payments/checkout" element={<Checkout />} />
            <Route path="/payments/history" element={<PaymentHistory />} />
            <Route path="/payments/:paymentId/receipt" element={<PaymentReceipt />} />

            {/* Admins only */}
            <Route element={<RequireRole roles={['Admin']} />}>
              <Route path="/payments/dashboard" element={<PaymentDashboard />} />
              <Route path="/payments/refunds" element={<RefundManagement />} />
              <Route path="/fleet/dashboard" element={<FleetDashboard />} />
              <Route path="/fleet/vehicles" element={<VehicleManagement />} />
              <Route path="/fleet/maintenance" element={<MaintenanceManagement />} />
              <Route path="/fleet/returns" element={<VehicleReturns />} />
            </Route>

            <Route path="/payments" element={<Navigate to="/payments/dashboard" replace />} />
            <Route path="/fleet" element={<Navigate to="/fleet/dashboard" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
