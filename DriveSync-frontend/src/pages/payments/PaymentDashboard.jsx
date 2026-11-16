// =============================================================
//  Payment Dashboard (Admin)
//  Data: GET /api/payments/stats  (one request, all numbers)
// =============================================================
import { Link, useNavigate } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Banknote, CircleAlert, Clock3, Landmark, ReceiptText, RefreshCw, ShieldCheck, Wallet, ArrowRight } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import { ErrorState, Spinner } from '../../components/ui/States';
import useAsync from '../../hooks/useAsync';
import { getPaymentStats } from '../../api/paymentApi';
import { formatMoney, formatMoneyShort, formatMonth, formatDateTime, shortId } from '../../utils/format';
import { CHART_COLORS } from '../../utils/statusStyles';

// Custom tooltip so chart values show as money
function MoneyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-ds-ink">{formatMonth(label)}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2 text-ds-muted">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="font-semibold text-ds-ink">{formatMoney(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

export default function PaymentDashboard() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsync(() => getPaymentStats(), []);
  const stats = data?.data;

  const count = (status) => stats?.statusBreakdown.find((s) => s.status === status)?.count ?? 0;
  const pieData = stats?.statusBreakdown.filter((s) => s.count > 0) || [];

  const columns = [
    { key: 'paymentId', header: 'Payment ID', render: (p) => <span className="font-mono text-xs font-semibold">{p.paymentId}</span> },
    { key: 'bookingId', header: 'Booking', render: (p) => <span className="font-mono text-xs text-ds-muted">{shortId(p.bookingId)}</span> },
    { key: 'paymentType', header: 'Type' },
    { key: 'amount', header: 'Amount', align: 'right', render: (p) => <span className="font-semibold tabular-nums">{formatMoney(p.amount, p.currency)}</span> },
    { key: 'date', header: 'Date', render: (p) => <span className="text-ds-muted">{formatDateTime(p.createdAt)}</span> },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.paymentStatus} /> },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={['Finance', 'Dashboard']}
        title="Payment Dashboard"
        subtitle="Revenue, deposits and transaction health at a glance."
        actions={
          <>
            <Button variant="secondary" icon={RefreshCw} onClick={reload} loading={loading && !!stats}>
              Refresh
            </Button>
            <Button icon={ReceiptText} onClick={() => navigate('/payments/history')}>
              All transactions
            </Button>
          </>
        }
      />

      {error && !stats ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          {/* ---------- KPI cards ---------- */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Total payments" value={stats?.totalPayments ?? 0} hint="All recorded transactions" icon={ReceiptText} tone="blue" loading={loading && !stats} />
            <StatCard label="Net revenue" value={formatMoneyShort(stats?.netRevenue)} hint={`Gross ${formatMoneyShort(stats?.grossCollected)} · refunded ${formatMoneyShort(stats?.totalRefunded)}`} icon={Banknote} tone="green" loading={loading && !stats} />
            <StatCard label="Pending" value={count('Pending')} hint="Awaiting confirmation (cash)" icon={Clock3} tone="orange" loading={loading && !stats} onClick={() => navigate('/payments/history?status=Pending')} />
            <StatCard label="Failed" value={count('Failed')} hint="Declined by the gateway" icon={CircleAlert} tone="red" loading={loading && !stats} onClick={() => navigate('/payments/history?status=Failed')} />
            <StatCard label="Deposits held" value={formatMoneyShort(stats?.depositsHeld)} hint={`${formatMoneyShort(stats?.totalDepositsCollected)} collected in total`} icon={ShieldCheck} tone="purple" loading={loading && !stats} />
          </div>

          {/* ---------- Charts ---------- */}
          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Card title="Monthly revenue" subtitle="Net revenue (after refunds), last 6 months" icon={Landmark} className="xl:col-span-2">
              {loading && !stats ? (
                <Spinner />
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.monthlyRevenue} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={CHART_COLORS.royal} stopOpacity={0.28} />
                          <stop offset="100%" stopColor={CHART_COLORS.royal} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="depositFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={CHART_COLORS.cyan} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={CHART_COLORS.cyan} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8ecf3" vertical={false} />
                      <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 12, fill: '#7a8292' }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={(v) => (v >= 1000 ? `${v / 1000}K` : v)} tick={{ fontSize: 12, fill: '#7a8292' }} axisLine={false} tickLine={false} width={48} />
                      <Tooltip content={<MoneyTooltip />} />
                      <Area type="monotone" dataKey="revenue" name="Net revenue" stroke={CHART_COLORS.royal} strokeWidth={2.5} fill="url(#revenueFill)" />
                      <Area type="monotone" dataKey="deposits" name="Deposits collected" stroke={CHART_COLORS.cyan} strokeWidth={2} fill="url(#depositFill)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            <Card title="Payment status" subtitle="Share of all transactions" icon={Wallet}>
              {loading && !stats ? (
                <Spinner />
              ) : pieData.length === 0 ? (
                <p className="py-16 text-center text-sm text-ds-muted">No payments yet</p>
              ) : (
                <>
                  <div className="relative h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} dataKey="count" nameKey="status" innerRadius={58} outerRadius={84} paddingAngle={3} strokeWidth={0}>
                          {pieData.map((s) => (
                            <Cell key={s.status} fill={CHART_COLORS[s.status]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v, n) => [`${v} payments`, n]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                      <div>
                        <p className="text-2xl font-bold text-ds-ink">{stats.totalPayments}</p>
                        <p className="text-xs text-ds-muted">payments</p>
                      </div>
                    </div>
                  </div>
                  <ul className="mt-2 grid grid-cols-2 gap-2">
                    {stats.statusBreakdown.map((s) => (
                      <li key={s.status} className="flex items-center justify-between rounded-xl bg-ds-surface px-3 py-2 text-xs">
                        <span className="flex items-center gap-2 font-medium text-ds-ink">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: CHART_COLORS[s.status] }} />
                          {s.status}
                        </span>
                        <span className="font-bold tabular-nums text-ds-ink">{s.count}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Card>
          </div>

          {/* ---------- Recent transactions ---------- */}
          <Card
            className="mt-6"
            bodyClassName="pt-4"
            title="Recent transactions"
            subtitle="Latest 6 payments across all customers"
            actions={
              <Link to="/payments/history" className="inline-flex items-center gap-1 text-sm font-semibold text-ds-link hover:underline">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            }
          >
            <DataTable
              columns={columns}
              rows={stats?.recentTransactions}
              rowKey="paymentId"
              loading={loading && !stats}
              emptyTitle="No transactions yet"
              emptyMessage="Payments will appear here as soon as customers check out."
              onRowClick={(p) => p.receiptNumber && navigate(`/payments/${p.paymentId}/receipt`)}
            />
          </Card>

          {stats?.methodBreakdown?.length > 0 && (
            <p className="mt-4 text-xs text-ds-muted">
              Most used payment method: <span className="font-semibold text-ds-ink">{stats.methodBreakdown[0].method}</span> ({stats.methodBreakdown[0].count} successful
              payments)
            </p>
          )}
        </>
      )}
    </>
  );
}
