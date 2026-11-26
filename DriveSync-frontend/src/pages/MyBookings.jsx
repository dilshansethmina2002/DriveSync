import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { CalendarDays, Car, CreditCard, MapPin, RefreshCw, XCircle } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import { EmptyState, Spinner } from '../components/ui/States';
import useAsync from '../hooks/useAsync';
import { getBookingsForUser, getCatalogVehicles } from '../api/bookingApi';
import apiClient from '../api/apiClient';
import { getErrorMessage } from '../api/httpClient';
import { getUser } from '../utils/auth';
import { formatDate, formatMoney, daysBetween, shortId } from '../utils/format';

export default function MyBookings() {
  const user = getUser();
  const navigate = useNavigate();
  const [cancellingId, setCancellingId] = useState(null);

  const bookingsReq = useAsync(
    () => (user?.id ? getBookingsForUser(user.id) : Promise.resolve({ data: [] })),
    [user?.id]
  );
  const catalogReq = useAsync(() => getCatalogVehicles(), []);

  const bookings = bookingsReq.data?.data || [];
  const vehicleById = useMemo(
    () => Object.fromEntries((catalogReq.data?.data || []).map((v) => [v._id, v])),
    [catalogReq.data]
  );

  const handleCancel = async (bookingId) => {
    setCancellingId(bookingId);
    try {
      await apiClient.delete(`/bookings/${bookingId}`);
      toast.success('Booking cancelled.');
      bookingsReq.reload();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Bookings"
        subtitle="Track your vehicle reservations, complete pending payments, or manage upcoming trips."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={bookingsReq.reload} disabled={bookingsReq.loading}>
              <RefreshCw className={`h-4 w-4 ${bookingsReq.loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link to="/catalog">
              <Button size="sm">
                <Car className="h-4 w-4" />
                Browse Vehicles
              </Button>
            </Link>
          </div>
        }
      />

      {bookingsReq.loading ? (
        <Card className="p-10 flex justify-center">
          <Spinner label="Loading your bookings..." />
        </Card>
      ) : bookings.length === 0 ? (
        <Card className="p-10">
          <EmptyState
            icon={CalendarDays}
            title="No bookings yet"
            description="You haven't reserved a vehicle yet. Explore the catalog to pick your ride!"
            action={
              <Link to="/catalog">
                <Button>Browse Vehicles</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {bookings.map((booking) => {
            const vehicle = vehicleById[booking.vehicleId];
            const days = daysBetween(booking.startDate, booking.endDate);
            const isPending = booking.status === 'Pending';
            const isConfirmed = booking.status === 'Confirmed';

            return (
              <Card key={booking._id} className="p-5 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-ds-muted">
                        Booking #{shortId(booking._id)}
                      </p>
                      <h3 className="text-lg font-bold text-ds-ink mt-0.5">
                        {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Reserved Vehicle'}
                      </h3>
                      {vehicle && (
                        <p className="text-xs text-ds-muted flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {vehicle.location} &bull; {vehicle.category} ({vehicle.year})
                        </p>
                      )}
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 rounded-xl bg-ds-surface p-3 text-xs">
                    <div>
                      <p className="text-ds-muted">Rental Period</p>
                      <p className="font-semibold text-ds-ink mt-0.5">
                        {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
                      </p>
                      <p className="text-ds-muted mt-0.5">{days} {days === 1 ? 'day' : 'days'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-ds-muted">Total Amount</p>
                      <p className="text-base font-extrabold text-ds-royal mt-0.5">
                        {formatMoney(booking.totalPrice)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                  {isPending && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancel(booking._id)}
                        disabled={cancellingId === booking._id}
                        className="text-rose-600 hover:bg-rose-50"
                      >
                        <XCircle className="h-4 w-4" />
                        {cancellingId === booking._id ? 'Cancelling...' : 'Cancel'}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          navigate('/payments/checkout', {
                            state: { bookingId: booking._id },
                          })
                        }
                      >
                        <CreditCard className="h-4 w-4" />
                        Pay Now
                      </Button>
                    </>
                  )}
                  {isConfirmed && (
                    <Link to="/payments/history">
                      <Button variant="secondary" size="sm">
                        View Payment & Receipt
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
