// =============================================================
//  Payment Checkout
//  1. Pick a booking (read from Member 2's Booking Service) - or enter it manually
//  2. Check what is already paid  (GET /api/payments/booking/:id/summary)
//  3. Choose a payment method and press "Pay now"
//  4. POST /api/payments  for the rental (and the security deposit)
//
//  SIMULATION ONLY: no card number / CVV fields exist anywhere.
// =============================================================
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Banknote, CalendarRange, Car, CheckCircle2, CreditCard, Landmark, Lock, PencilLine, ReceiptText, RefreshCw, ShieldCheck, Smartphone, Wallet, XCircle, Clock3, Search,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { Input, Checkbox } from '../../components/ui/FormField';
import { ConfirmDialog } from '../../components/ui/Modal';
import { Spinner, EmptyState } from '../../components/ui/States';
import useAsync from '../../hooks/useAsync';
import { getBookingsForUser, getCatalogVehicles } from '../../api/bookingApi';
import { createPayment, getBookingSummary } from '../../api/paymentApi';
import { getErrorMessage } from '../../api/httpClient';
import { getUser, isAdmin } from '../../utils/auth';
import { SECURITY_DEPOSIT, CURRENCY } from '../../config/appConfig';
import { formatMoney, formatDate, shortId, daysBetween, todayInput } from '../../utils/format';
import { isMongoId, isMoney, validate, required } from '../../utils/validators';

const METHODS = [
  { value: 'Credit Card', icon: CreditCard, note: 'Visa / Mastercard (simulated)' },
  { value: 'Debit Card', icon: Wallet, note: 'Instant debit (simulated)' },
  { value: 'Online Wallet', icon: Smartphone, note: 'eZ Cash, Genie… (simulated)' },
  { value: 'Bank Transfer', icon: Landmark, note: 'Direct transfer (simulated)' },
  { value: 'Cash', icon: Banknote, note: 'Pay at counter: stays Pending' },
];

const EMPTY_MANUAL = { bookingId: '', customerId: '', vehicleId: '', startDate: todayInput(), endDate: '', amount: '' };

export default function Checkout() {
  const user = getUser();
  const admin = isAdmin(user);

  // ---------- Bookings (from Booking Service) ----------
  const [customerId, setCustomerId] = useState(admin ? '' : user?.id);
  const [lookupId, setLookupId] = useState(admin ? '' : user?.id);
  const bookingsReq = useAsync(() => (lookupId ? getBookingsForUser(lookupId) : Promise.resolve({ data: [] })), [lookupId]);
  const catalogReq = useAsync(() => getCatalogVehicles(), []);
  const bookings = (bookingsReq.data?.data || []).filter((b) => !['Cancelled', 'Completed'].includes(b.status));
  const vehicleById = useMemo(() => Object.fromEntries((catalogReq.data?.data || []).map((v) => [v._id, v])), [catalogReq.data]);

  // ---------- Selection ----------
  const [mode, setMode] = useState('booking'); // 'booking' | 'manual'
  const [selected, setSelected] = useState(null);
  const [manual, setManual] = useState(EMPTY_MANUAL);
  const [errors, setErrors] = useState({});

  // ---------- Payment options ----------
  const [method, setMethod] = useState('Credit Card');
  const [includeDeposit, setIncludeDeposit] = useState(true);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [results, setResults] = useState(null);

  // The "order" being paid, built from the chosen booking or the manual form
  const order = useMemo(() => {
    if (mode === 'booking' && selected) {
      return {
        bookingId: selected._id,
        customerId: selected.userId || customerId,
        vehicleId: selected.vehicleId,
        startDate: selected.startDate,
        endDate: selected.endDate,
        rental: Number(selected.totalPrice) || 0,
        status: selected.status,
      };
    }
    if (mode === 'manual' && isMongoId(manual.bookingId)) {
      return {
        bookingId: manual.bookingId.trim(),
        customerId: admin ? manual.customerId.trim() : user?.id,
        vehicleId: manual.vehicleId.trim(),
        startDate: manual.startDate,
        endDate: manual.endDate,
        rental: Number(manual.amount) || 0,
      };
    }
    return null;
  }, [mode, selected, manual, customerId, admin, user?.id]);

  // When the booking changes, ask the Payment Service what is already paid
  const summaryReq = useAsync(() => (order?.bookingId ? getBookingSummary(order.bookingId) : Promise.resolve(null)), [order?.bookingId]);
  const summary = summaryReq.data?.data || null;
  const summaryLoading = summaryReq.loading;

  const rentalDue = order && !summary?.rentalPaid ? order.rental : 0;
  const depositDue = order && includeDeposit && !summary?.depositPaid ? SECURITY_DEPOSIT : 0;
  const total = rentalDue + depositDue;
  const vehicle = order ? vehicleById[order.vehicleId] : null;
  const nothingToPay = order && total === 0;

  const setManualField = (field) => (e) => {
    setManual((m) => ({ ...m, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  // ---------- Validation before paying ----------
  const validateOrder = () => {
    if (mode === 'booking') {
      if (!selected) {
        toast.error('Please select a booking to pay for');
        return false;
      }
      return true;
    }
    const rules = {
      bookingId: [required('Booking ID is required'), [isMongoId, 'Booking ID must be 24 hexadecimal characters']],
      vehicleId: [required('Vehicle ID is required'), [isMongoId, 'Vehicle ID must be 24 hexadecimal characters']],
      startDate: [required('Start date is required')],
      endDate: [required('End date is required'), [(v, all) => !all.startDate || new Date(v) > new Date(all.startDate), 'End date must be after the start date']],
      amount: [required('Rental price is required'), [isMoney, 'Enter a positive amount (max 2 decimals)']],
    };
    if (admin) rules.customerId = [required('Customer ID is required'), [isMongoId, 'Customer ID must be 24 hexadecimal characters']];
    const found = validate(manual, rules);
    setErrors(found);
    if (Object.keys(found).length) toast.error('Please fix the highlighted fields');
    return Object.keys(found).length === 0;
  };

  const handlePayClick = () => {
    if (!validateOrder()) return;
    if (nothingToPay) return toast('This booking is already fully paid.', { icon: 'ℹ️' });
    setConfirmOpen(true);
  };

  // ---------- Pay: rental first, then the deposit ----------
  const pay = async () => {
    setPaying(true);
    const done = [];
    const base = { bookingId: order.bookingId, customerId: order.customerId, vehicleId: order.vehicleId, paymentMethod: method, currency: CURRENCY };

    const charge = async (paymentType, amount, description) => {
      try {
        const res = await createPayment({ ...base, paymentType, amount, description, ...(simulateFailure && { simulateFailure: true }) });
        done.push({ paymentType, ok: true, payment: res.data, message: res.message });
        return true;
      } catch (err) {
        // 402 = declined by the gateway: the backend still returns the failed payment
        done.push({ paymentType, ok: false, payment: err.response?.data?.data, message: getErrorMessage(err) });
        return false;
      }
    };

    let ok = true;
    if (rentalDue > 0) ok = await charge('Rental Payment', rentalDue, `Rental ${formatDate(order.startDate)} – ${formatDate(order.endDate)}`);
    if (ok && depositDue > 0) await charge('Security Deposit', depositDue, 'Refundable security deposit');

    setPaying(false);
    setConfirmOpen(false);
    setResults(done);

    if (done.every((r) => r.ok)) toast.success(method === 'Cash' ? 'Payment recorded. Please pay at the counter.' : 'Payment successful!');
    else toast.error('Payment could not be completed');
  };

  const resetAll = () => {
    setResults(null);
    setSelected(null);
    setManual(EMPTY_MANUAL);
    setSimulateFailure(false);
    bookingsReq.reload();
    summaryReq.reload();
  };

  // =============================================================
  //  Result screen
  // =============================================================
  if (results) {
    const allOk = results.every((r) => r.ok);
    const pending = results.some((r) => r.payment?.paymentStatus === 'Pending');
    return (
      <div className="mx-auto max-w-2xl">
        <Card bodyClassName="p-8 text-center">
          <span className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${allOk ? (pending ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600') : 'bg-rose-100 text-rose-600'}`}>
            {allOk ? pending ? <Clock3 className="h-8 w-8" /> : <CheckCircle2 className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
          </span>
          <h1 className="mt-4 text-2xl font-bold text-ds-ink">{allOk ? (pending ? 'Payment recorded' : 'Payment successful') : 'Payment failed'}</h1>
          <p className="mt-1 text-sm text-ds-muted">
            {allOk ? (pending ? 'Your payment is Pending until our staff confirm the cash payment.' : 'Thank you! Your receipt is ready.') : 'No further charges were made. You can try again with another method.'}
          </p>

          <ul className="mt-6 space-y-3 text-left">
            {results.map((r) => (
              <li key={r.paymentType} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-ds-ink">{r.paymentType}</p>
                  <StatusBadge status={r.payment?.paymentStatus || 'Failed'} />
                </div>
                {r.payment && (
                  <p className="mt-1 text-sm text-ds-muted">
                    {formatMoney(r.payment.amount, r.payment.currency)} · <span className="font-mono text-xs">{r.payment.paymentId}</span>
                  </p>
                )}
                {!r.ok && <p className="mt-1 text-sm text-rose-600">{r.message}</p>}
                {r.payment?.receiptNumber && (
                  <Link to={`/payments/${r.payment.paymentId}/receipt`} className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-ds-link hover:underline">
                    <ReceiptText className="h-4 w-4" /> View receipt {r.payment.receiptNumber}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            {!allOk && (
              <Button
                variant="primary"
                icon={RefreshCw}
                onClick={() => {
                  setResults(null);
                  summaryReq.reload(); // re-check: the rental may have succeeded even if the deposit failed
                }}
              >
                Try again
              </Button>
            )}
            <Button variant="secondary" onClick={resetAll}>
              Make another payment
            </Button>
            <Link to="/payments/history">
              <Button variant="ghost" className="w-full">
                Go to payment history
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // =============================================================
  //  Checkout screen
  // =============================================================
  return (
    <>
      <PageHeader breadcrumb={['Finance', 'Checkout']} title="Payment Checkout" subtitle="Pay the rental and refundable security deposit for a booking." />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          {/* ---------- Step 1: booking ---------- */}
          <Card
            title="1. Select booking"
            subtitle={mode === 'booking' ? 'Bookings loaded from the Booking Service' : 'Enter the booking details manually'}
            icon={CalendarRange}
            actions={
              <div className="flex rounded-xl bg-ds-surface p-1 text-xs font-semibold">
                {[
                  ['booking', 'My bookings'],
                  ['manual', 'Enter manually'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => {
                      setMode(value);
                      setSelected(null);
                    }}
                    className={`rounded-lg px-3 py-1.5 transition ${mode === value ? 'bg-white text-ds-royal shadow-sm' : 'text-ds-muted hover:text-ds-ink'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            }
          >
            {mode === 'booking' ? (
              <>
                {admin && (
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end">
                    <Input
                      className="flex-1"
                      label="Customer ID"
                      name="lookupCustomer"
                      placeholder="24-character customer ID"
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      error={customerId && !isMongoId(customerId) ? 'Must be 24 hexadecimal characters' : undefined}
                    />
                    <Button icon={Search} variant="dark" disabled={!isMongoId(customerId)} onClick={() => setLookupId(customerId.trim())}>
                      Load bookings
                    </Button>
                  </div>
                )}

                {bookingsReq.loading ? (
                  <Spinner label="Loading bookings…" />
                ) : bookingsReq.error ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <p className="font-semibold">Could not load bookings from the Booking Service.</p>
                    <p className="mt-1 text-amber-700">{bookingsReq.error}</p>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="secondary" icon={RefreshCw} onClick={bookingsReq.reload}>
                        Retry
                      </Button>
                      <Button size="sm" variant="secondary" icon={PencilLine} onClick={() => setMode('manual')}>
                        Enter details manually
                      </Button>
                    </div>
                  </div>
                ) : bookings.length === 0 ? (
                  <EmptyState
                    icon={Car}
                    title={admin && !lookupId ? 'Enter a customer ID' : 'No open bookings'}
                    message={admin && !lookupId ? 'Load a customer’s bookings, or switch to manual entry.' : 'Create a booking first, or enter the booking details manually.'}
                    action={
                      <Button size="sm" variant="secondary" icon={PencilLine} onClick={() => setMode('manual')}>
                        Enter manually
                      </Button>
                    }
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {bookings.map((b) => {
                      const v = vehicleById[b.vehicleId];
                      const active = selected?._id === b._id;
                      return (
                        <button
                          key={b._id}
                          onClick={() => setSelected(b)}
                          className={`rounded-2xl border-2 p-4 text-left transition ${active ? 'border-ds-royal bg-ds-royal/5 shadow-sm' : 'border-slate-200 hover:border-ds-royal/40'}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <span className={`grid h-10 w-10 place-items-center rounded-xl ${active ? 'bg-ds-royal text-white' : 'bg-ds-surface text-ds-royal'}`}>
                                <Car className="h-5 w-5" />
                              </span>
                              <div>
                                <p className="font-semibold text-ds-ink">{v ? `${v.brand} ${v.model}` : 'Vehicle'}</p>
                                <p className="font-mono text-[11px] text-ds-muted">Booking {shortId(b._id)}</p>
                              </div>
                            </div>
                            <StatusBadge status={b.status} />
                          </div>
                          <div className="mt-3 flex items-center justify-between text-sm">
                            <span className="text-ds-muted">
                              {formatDate(b.startDate)} → {formatDate(b.endDate)}
                            </span>
                            <span className="font-bold text-ds-ink">{formatMoney(b.totalPrice)}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Booking ID" name="bookingId" required value={manual.bookingId} onChange={setManualField('bookingId')} error={errors.bookingId} placeholder="24-character booking ID" />
                {admin && (
                  <Input label="Customer ID" name="customerId" required value={manual.customerId} onChange={setManualField('customerId')} error={errors.customerId} placeholder="24-character customer ID" />
                )}
                <Input label="Vehicle ID" name="vehicleId" required value={manual.vehicleId} onChange={setManualField('vehicleId')} error={errors.vehicleId} placeholder="Catalog vehicle ID" />
                <Input label="Rental price" name="amount" type="number" min="0" step="0.01" required prefix={CURRENCY} value={manual.amount} onChange={setManualField('amount')} error={errors.amount} />
                <Input label="Start date" name="startDate" type="date" required value={manual.startDate} onChange={setManualField('startDate')} error={errors.startDate} />
                <Input label="End date" name="endDate" type="date" required value={manual.endDate} onChange={setManualField('endDate')} error={errors.endDate} />
              </div>
            )}
          </Card>

          {/* ---------- Step 2: method ---------- */}
          <Card title="2. Payment method" subtitle="This is a simulated gateway: no card details are collected or stored" icon={CreditCard}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" role="radiogroup" aria-label="Payment method">
              {METHODS.map(({ value, icon: Icon, note }) => {
                const active = method === value;
                return (
                  <button
                    key={value}
                    role="radio"
                    aria-checked={active}
                    onClick={() => setMethod(value)}
                    className={`flex items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition ${active ? 'border-ds-royal bg-ds-royal/5' : 'border-slate-200 hover:border-ds-royal/40'}`}
                  >
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${active ? 'bg-ds-royal text-white' : 'bg-ds-surface text-ds-muted'}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-ds-ink">{value}</span>
                      <span className="block truncate text-xs text-ds-muted">{note}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <Checkbox
                label={`Include refundable security deposit (${formatMoney(SECURITY_DEPOSIT)})`}
                description={summary?.depositPaid ? 'Deposit already paid for this booking' : 'Returned after the vehicle comes back in good condition'}
                checked={includeDeposit && !summary?.depositPaid}
                disabled={!!summary?.depositPaid}
                onChange={setIncludeDeposit}
              />
              {method !== 'Cash' && (
                <Checkbox
                  label="Test: simulate a declined payment"
                  description="Demo option: the simulated gateway will reject the charge"
                  checked={simulateFailure}
                  onChange={setSimulateFailure}
                />
              )}
            </div>
          </Card>
        </div>

        {/* ---------- Order summary ---------- */}
        <div className="xl:sticky xl:top-24 xl:self-start">
          <Card title="Order summary" icon={ReceiptText}>
            {!order ? (
              <p className="py-10 text-center text-sm text-ds-muted">Select a booking to see the amount due.</p>
            ) : (
              <>
                <div className="rounded-2xl bg-gradient-to-br from-ds-navy to-ds-royal p-4 text-white">
                  <p className="text-xs uppercase tracking-wider text-white/60">Vehicle</p>
                  <p className="mt-0.5 font-semibold">{vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : shortId(order.vehicleId)}</p>
                  {vehicle && (
                    <p className="text-xs text-white/70">
                      {vehicle.category} · {vehicle.location} · {formatMoney(vehicle.dailyRate)}/day
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <CalendarRange className="h-4 w-4 text-ds-cyan" />
                    {formatDate(order.startDate)} → {formatDate(order.endDate)}
                    <span className="text-white/60">({daysBetween(order.startDate, order.endDate)} days)</span>
                  </div>
                </div>

                <dl className="mt-4 divide-y divide-slate-100 text-sm">
                  <div className="flex justify-between py-2.5">
                    <dt className="text-ds-muted">Booking ID</dt>
                    <dd className="font-mono text-xs font-semibold text-ds-ink">{shortId(order.bookingId, 8, 6)}</dd>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <dt className="text-ds-muted">Customer ID</dt>
                    <dd className="font-mono text-xs font-semibold text-ds-ink">{shortId(order.customerId, 8, 6)}</dd>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <dt className="text-ds-muted">Rental price</dt>
                    <dd className={`font-semibold ${summary?.rentalPaid ? 'text-emerald-600' : 'text-ds-ink'}`}>
                      {summary?.rentalPaid ? 'Paid ✓' : formatMoney(order.rental)}
                    </dd>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <dt className="text-ds-muted">Security deposit</dt>
                    <dd className={`font-semibold ${summary?.depositPaid ? 'text-emerald-600' : 'text-ds-ink'}`}>
                      {summary?.depositPaid ? 'Paid ✓' : includeDeposit ? formatMoney(SECURITY_DEPOSIT) : 'Not included'}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between pt-4">
                    <dt className="font-semibold text-ds-ink">Total due now</dt>
                    <dd className="text-2xl font-bold text-ds-royal tabular-nums">{summaryLoading ? '…' : formatMoney(total)}</dd>
                  </div>
                </dl>

                {summary?.pendingPayments > 0 && (
                  <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
                    This booking has {summary.pendingPayments} pending payment(s) awaiting confirmation.
                  </p>
                )}
              </>
            )}

            <Button className="mt-5 w-full" size="lg" icon={Lock} onClick={handlePayClick} disabled={!order || summaryLoading || nothingToPay}>
              {nothingToPay ? 'Fully paid' : `Pay now${order ? ` · ${formatMoney(total)}` : ''}`}
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-ds-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Simulated payment gateway: no real money is charged
            </p>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={pay}
        loading={paying}
        title="Confirm payment"
        confirmLabel={`Pay ${formatMoney(total)}`}
        message={
          <>
            You are about to pay <strong className="text-ds-ink">{formatMoney(total)}</strong> by <strong className="text-ds-ink">{method}</strong> for booking{' '}
            <span className="font-mono text-xs">{shortId(order?.bookingId)}</span>.
            {simulateFailure && <span className="mt-2 block font-semibold text-rose-600">Test mode: this payment will be declined.</span>}
          </>
        }
      />
    </>
  );
}
