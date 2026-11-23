// =============================================================
//  Sidebar menu definition
//  roles: who can see the link ('Admin', 'Customer'). No roles = everyone.
// =============================================================
import { CreditCard, FileClock, LayoutDashboard, RotateCcw, Car, Wrench, Undo2, Gauge } from 'lucide-react';

export const NAV_SECTIONS = [
  {
    title: 'Finance',
    items: [
      { to: '/payments/dashboard', label: 'Payment Dashboard', icon: LayoutDashboard, roles: ['Admin'] },
      { to: '/payments/checkout', label: 'Checkout', icon: CreditCard },
      { to: '/payments/history', label: 'Payment History', icon: FileClock, customerLabel: 'My Payments' },
      { to: '/payments/refunds', label: 'Refunds', icon: RotateCcw, roles: ['Admin'] },
    ],
  },
  {
    title: 'Fleet Operations',
    roles: ['Admin'],
    items: [
      { to: '/fleet/dashboard', label: 'Fleet Dashboard', icon: Gauge, roles: ['Admin'] },
      { to: '/fleet/vehicles', label: 'Vehicles', icon: Car, roles: ['Admin'] },
      { to: '/fleet/maintenance', label: 'Maintenance', icon: Wrench, roles: ['Admin'] },
      { to: '/fleet/returns', label: 'Vehicle Returns', icon: Undo2, roles: ['Admin'] },
    ],
  },
];

/** Page title shown in the top bar, found from the current URL */
export const titleForPath = (pathname) => {
  if (/^\/payments\/[^/]+\/receipt/.test(pathname)) return 'Payment Receipt';
  for (const section of NAV_SECTIONS) {
    const item = section.items.find((i) => pathname.startsWith(i.to));
    if (item) return item.label;
  }
  return 'DriveSync';
};
