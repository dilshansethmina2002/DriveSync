import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { CalendarCheck, Check, Play, RefreshCw, X } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { EmptyState, Spinner } from '../../components/ui/States';
import apiClient from '../../api/apiClient';
import { getErrorMessage } from '../../api/httpClient';
import { formatDate, formatMoney, shortId } from '../../utils/format';

const STATUS_FILTERS = ['All', 'Pending', 'Confirmed', 'Ongoing', 'Completed', 'Cancelled'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [bRes, vRes, uRes] = await Promise.allSettled([
        apiClient.get('/bookings'),
        apiClient.get('/catalog'),
        apiClient.get('/auth/admin/users'),
      ]);

      setBookings(bRes.status === 'fulfilled' ? bRes.value.data?.data || [] : []);
      setVehicles(vRes.status === 'fulfilled' ? vRes.value.data?.data || [] : []);
      setUsers(uRes.status === 'fulfilled' ? uRes.value.data?.data || [] : []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const vehicleMap = useMemo(() => Object.fromEntries(vehicles.map((v) => [v._id, v])), [vehicles]);
  const userMap = useMemo(() => Object.fromEntries(users.map((u) => [u._id, u])), [users]);

  const filteredBookings = useMemo(() => {
    if (statusFilter === 'All') return bookings;
    return bookings.filter((b) => b.status === statusFilter);
  }, [bookings, statusFilter]);

  const handleStatusChange = async (bookingId, nextStatus) => {
    setUpdatingId(bookingId);
    try {
      await apiClient.patch(`/bookings/${bookingId}/status`, { status: nextStatus });
      toast.success(`Booking marked as ${nextStatus}`);
      await loadAll();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointment & Booking Management"
        subtitle="Approve or reject incoming booking requests, track handovers, and complete rentals."
        actions={
          <Button variant="secondary" size="sm" onClick={loadAll} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      {/* Status Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition cursor-pointer ${
              statusFilter === st
                ? 'bg-ds-royal text-white shadow-xs'
                : 'bg-white text-ds-ink border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {loading ? (
        <Card className="p-10 flex justify-center">
          <Spinner label="Loading bookings..." />
        </Card>
      ) : filteredBookings.length === 0 ? (
        <Card className="p-10">
          <EmptyState
            icon={CalendarCheck}
            title="No bookings found"
            description="There are no bookings matching the selected status filter."
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-ds-surface text-xs font-bold uppercase tracking-wider text-ds-muted">
                <tr>
                  <th className="px-5 py-3.5">Booking</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Vehicle & Schedule</th>
                  <th className="px-5 py-3.5">Total</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => {
                  const vehicle = vehicleMap[b.vehicleId];
                  const customer = userMap[b.userId];
                  const busy = updatingId === b._id;

                  return (
                    <tr key={b._id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3.5 text-xs font-semibold text-ds-muted">
                        #{shortId(b._id)}
                        {b.packageName && (
                          <span className="block text-[11px] text-ds-royal font-bold mt-0.5">{b.packageName}</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-ds-ink text-xs">{customer?.name || shortId(b.userId)}</p>
                        <p className="text-[11px] text-ds-muted">{customer?.email || 'Customer'}</p>
                      </td>
                      <td className="px-5 py-3.5 text-xs">
                        <p className="font-bold text-ds-ink">
                          {vehicle ? `${vehicle.brand} ${vehicle.model}` : shortId(b.vehicleId)}
                        </p>
                        <p className="text-ds-muted mt-0.5">
                          {formatDate(b.startDate)} ({b.pickupTime || '09:00'}) &rarr; {formatDate(b.endDate)} ({b.returnTime || '18:00'})
                        </p>
                        {b.pickupLocation && (
                          <p className="text-[11px] text-ds-muted">Pickup: {b.pickupLocation}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-ds-ink">{formatMoney(b.totalPrice)}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {b.status === 'Pending' && (
                            <>
                              <Button
                                size="sm"
                                disabled={busy}
                                onClick={() => handleStatusChange(b._id, 'Confirmed')}
                                className="bg-emerald-600 hover:bg-emerald-700"
                              >
                                <Check className="h-3.5 w-3.5" /> Approve
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={busy}
                                onClick={() => handleStatusChange(b._id, 'Cancelled')}
                                className="text-rose-600 hover:bg-rose-50"
                              >
                                <X className="h-3.5 w-3.5" /> Reject
                              </Button>
                            </>
                          )}
                          {b.status === 'Confirmed' && (
                            <Button
                              size="sm"
                              disabled={busy}
                              onClick={() => handleStatusChange(b._id, 'Ongoing')}
                            >
                              <Play className="h-3.5 w-3.5" /> Start Trip
                            </Button>
                          )}
                          {b.status === 'Ongoing' && (
                            <Button
                              size="sm"
                              disabled={busy}
                              onClick={() => handleStatusChange(b._id, 'Completed')}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              <Check className="h-3.5 w-3.5" /> Complete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
