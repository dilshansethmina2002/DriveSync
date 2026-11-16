// =============================================================
//  Fleet Dashboard (Admin)   GET /api/fleet/stats
// =============================================================
import { useNavigate, Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Car, CheckCircle2, KeyRound, Wrench, PauseCircle, RefreshCw, CalendarClock, Hammer, Coins, ArrowRight, Activity, Plus } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { ErrorState, Spinner, EmptyState } from '../../components/ui/States';
import useAsync from '../../hooks/useAsync';
import { getFleetStats } from '../../api/fleetApi';
import { CHART_COLORS } from '../../utils/statusStyles';
import { formatMoneyShort, formatDate, formatMoney } from '../../utils/format';

const CONDITION_COLORS = { Excellent: '#10b981', Good: '#5c93e8', Fair: '#f59e0b', Poor: '#fb7185', Damaged: '#e11d48' };

export default function FleetDashboard() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsync(() => getFleetStats(), []);
  const s = data?.data;
  const first = loading && !s;
  const pct = (n) => (s?.totalVehicles ? `${Math.round((n / s.totalVehicles) * 100)}% of fleet` : '—');

  return (
    <>
      <PageHeader
        breadcrumb={['Fleet Operations', 'Dashboard']}
        title="Fleet Dashboard"
        subtitle="Live operational status of every vehicle."
        actions={
          <>
            <Button variant="secondary" icon={RefreshCw} onClick={reload} loading={loading && !!s}>
              Refresh
            </Button>
            <Button icon={Plus} onClick={() => navigate('/fleet/vehicles?add=1')}>
              Add vehicle
            </Button>
          </>
        }
      />

      {error && !s ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Total vehicles" value={s?.totalVehicles ?? 0} hint="Registered in fleet" icon={Car} tone="blue" loading={first} onClick={() => navigate('/fleet/vehicles')} />
            <StatCard label="Available" value={s?.available ?? 0} hint={pct(s?.available)} icon={CheckCircle2} tone="green" loading={first} onClick={() => navigate('/fleet/vehicles?status=Available')} />
            <StatCard label="Rented" value={s?.rented ?? 0} hint={pct(s?.rented)} icon={KeyRound} tone="cyan" loading={first} onClick={() => navigate('/fleet/vehicles?status=Rented')} />
            <StatCard label="Under maintenance" value={s?.underMaintenance ?? 0} hint={`${s?.openMaintenance ?? 0} open job(s)`} icon={Wrench} tone="red" loading={first} onClick={() => navigate('/fleet/vehicles?status=Under%20Maintenance')} />
            <StatCard label="Inactive" value={s?.inactive ?? 0} hint="Out of service" icon={PauseCircle} tone="slate" loading={first} onClick={() => navigate('/fleet/vehicles?status=Inactive')} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Status donut */}
            <Card title="Vehicle status" subtitle="Fleet availability right now" icon={Activity}>
              {first ? (
                <Spinner />
              ) : s.totalVehicles === 0 ? (
                <EmptyState icon={Car} title="No vehicles yet" message="Register your first vehicle to see fleet statistics." />
              ) : (
                <>
                  <div className="relative h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={s.statusBreakdown.filter((x) => x.count)} dataKey="count" nameKey="status" innerRadius={58} outerRadius={84} paddingAngle={3} strokeWidth={0}>
                          {s.statusBreakdown
                            .filter((x) => x.count)
                            .map((x) => (
                              <Cell key={x.status} fill={CHART_COLORS[x.status]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(v, n) => [`${v} vehicles`, n]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                      <div>
                        <p className="text-2xl font-bold text-ds-ink">{Math.round((s.available / s.totalVehicles) * 100)}%</p>
                        <p className="text-xs text-ds-muted">available</p>
                      </div>
                    </div>
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {s.statusBreakdown.map((x) => (
                      <li key={x.status} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-ds-ink">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: CHART_COLORS[x.status] }} />
                          {x.status}
                        </span>
                        <span className="font-semibold tabular-nums">{x.count}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Card>

            {/* Condition bars */}
            <Card title="Vehicle condition" subtitle="Updated after every return and service" icon={Car}>
              {first ? (
                <Spinner />
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={s.conditionBreakdown} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8ecf3" vertical={false} />
                      <XAxis dataKey="condition" tick={{ fontSize: 12, fill: '#7a8292' }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#7a8292' }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: '#f3f5f8' }} formatter={(v) => [`${v} vehicles`, 'Count']} />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={44}>
                        {s.conditionBreakdown.map((c) => (
                          <Cell key={c.condition} fill={CONDITION_COLORS[c.condition]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* Maintenance KPIs */}
            <div className="grid grid-cols-1 gap-4">
              <StatCard label="Due for maintenance" value={s?.dueForMaintenance ?? 0} hint="Next service date has passed" icon={CalendarClock} tone="orange" loading={first} onClick={() => navigate('/fleet/vehicles?due=1')} />
              <StatCard label="Open maintenance jobs" value={s?.openMaintenance ?? 0} hint="Status: In Progress" icon={Hammer} tone="red" loading={first} onClick={() => navigate('/fleet/maintenance?status=In%20Progress')} />
              <StatCard label="Total maintenance cost" value={formatMoneyShort(s?.totalMaintenanceCost)} hint="All recorded jobs" icon={Coins} tone="purple" loading={first} />
            </div>
          </div>

          {/* Recent maintenance */}
          <Card
            className="mt-6"
            title="Recent maintenance activity"
            subtitle="Latest jobs opened or completed"
            icon={Wrench}
            actions={
              <Link to="/fleet/maintenance" className="inline-flex items-center gap-1 text-sm font-semibold text-ds-link hover:underline">
                Manage <ArrowRight className="h-4 w-4" />
              </Link>
            }
          >
            {first ? (
              <Spinner />
            ) : s.recentMaintenance.length === 0 ? (
              <EmptyState icon={Wrench} title="No maintenance recorded" />
            ) : (
              <ul className="divide-y divide-slate-100">
                {s.recentMaintenance.map((m) => (
                  <li key={m.maintenanceId} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${m.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        <Wrench className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ds-ink">
                          {m.maintenanceType} · <span className="font-mono">{m.vehicle?.registrationNumber || m.vehicleId}</span>
                        </p>
                        <p className="truncate text-xs text-ds-muted">{m.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pl-13 sm:pl-0">
                      <span className="text-xs text-ds-muted">{formatDate(m.completedDate || m.startDate)}</span>
                      <span className="text-sm font-semibold tabular-nums">{formatMoney(m.cost)}</span>
                      <StatusBadge status={m.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </>
  );
}
