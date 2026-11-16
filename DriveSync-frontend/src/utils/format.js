// =============================================================
//  Formatting helpers used across the UI
// =============================================================
import { CURRENCY } from '../config/appConfig';

export const formatMoney = (amount, currency = CURRENCY) =>
  `${currency} ${Number(amount || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Short version for stat cards: LKR 1.2M, LKR 45.5K */
export const formatMoneyShort = (amount, currency = CURRENCY) => {
  const n = Number(amount || 0);
  if (n >= 1_000_000) return `${currency} ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${currency} ${(n / 1000).toFixed(1)}K`;
  return formatMoney(n, currency);
};

export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

/** "2026-11" -> "Nov 26" (chart labels) */
export const formatMonth = (yyyyMm) => {
  const [y, m] = yyyyMm.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-GB', { month: 'short', year: '2-digit', timeZone: 'UTC' });
};

/** Value for <input type="date"> */
export const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');
// Today's date in the user's LOCAL time zone (toISOString() would use UTC,
// which is still "yesterday" in Sri Lanka between 00:00 and 05:30)
export const todayInput = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Long Mongo ids are hard to read: 6650a1b2...4567 */
export const shortId = (id, start = 6, end = 4) => (id && id.length > start + end + 3 ? `${id.slice(0, start)}…${id.slice(-end)}` : id || '—');

export const daysBetween = (start, end) => {
  if (!start || !end) return 0;
  return Math.max(1, Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)));
};
