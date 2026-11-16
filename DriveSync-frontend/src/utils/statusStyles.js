// =============================================================
//  One place that decides the colour of every status badge
//  green = good, orange = waiting, red = failed / maintenance, blue/grey = neutral
// =============================================================
const GREEN = 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
const ORANGE = 'bg-amber-50 text-amber-700 ring-amber-600/25';
const RED = 'bg-rose-50 text-rose-700 ring-rose-600/20';
const BLUE = 'bg-blue-50 text-ds-royal ring-ds-royal/20';
const GREY = 'bg-slate-100 text-slate-600 ring-slate-500/20';
const PURPLE = 'bg-violet-50 text-violet-700 ring-violet-600/20';

export const STATUS_STYLES = {
  // Payments
  Successful: GREEN,
  Pending: ORANGE,
  Failed: RED,
  Refunded: PURPLE,
  // Vehicles
  Available: GREEN,
  Rented: BLUE,
  'Under Maintenance': RED,
  Inactive: GREY,
  // Maintenance
  'In Progress': ORANGE,
  Completed: GREEN,
  // Condition
  Excellent: GREEN,
  Good: GREEN,
  Fair: ORANGE,
  Poor: RED,
  Damaged: RED,
  // Bookings (Member 2)
  Confirmed: GREEN,
  Cancelled: GREY,
};

export const DOT_STYLES = {
  [GREEN]: 'bg-emerald-500',
  [ORANGE]: 'bg-amber-500',
  [RED]: 'bg-rose-500',
  [BLUE]: 'bg-ds-royal',
  [GREY]: 'bg-slate-400',
  [PURPLE]: 'bg-violet-500',
};

// Chart colours (hex, because Recharts needs real colour values)
export const CHART_COLORS = {
  Successful: '#10b981',
  Pending: '#f59e0b',
  Failed: '#f43f5e',
  Refunded: '#8b5cf6',
  Available: '#10b981',
  Rented: '#204ec6',
  'Under Maintenance': '#f43f5e',
  Inactive: '#94a3b8',
  royal: '#204ec6',
  cyan: '#4db6e5',
  sky: '#5c93e8',
  navy: '#142654',
};
