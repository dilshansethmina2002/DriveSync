// =============================================================
//  Digital receipt   GET /api/payments/:paymentId/receipt
//  "Download / Print" uses the browser print dialog -> "Save as PDF".
//  Sidebar, top bar and buttons are hidden when printing (print:hidden).
// =============================================================
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, CheckCircle2, RotateCcw } from 'lucide-react';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { ErrorState, Spinner } from '../../components/ui/States';
import { DetailRow } from '../../components/ui/PageHeader';
import useAsync from '../../hooks/useAsync';
import { getReceipt } from '../../api/paymentApi';
import { getCatalogVehicles } from '../../api/bookingApi';
import { getUser } from '../../utils/auth';
import { formatMoney, formatDateTime } from '../../utils/format';

export default function PaymentReceipt() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const user = getUser();
  const { data, loading, error, reload } = useAsync(() => getReceipt(paymentId), [paymentId]);
  // Optional: vehicle name from the Catalog Service (receipt still works without it)
  const catalog = useAsync(() => getCatalogVehicles(), []);

  if (loading) return <Spinner label="Generating receipt…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const r = data.data;
  const vehicle = (catalog.data?.data || []).find((v) => v._id === r.booking.vehicleId);
  const isOwnReceipt = String(user?.id) === String(r.booking.customerId);
  const refunded = r.amount.refunded > 0;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Toolbar (not printed) */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(-1)}>
          Back
        </Button>
        <Button icon={Printer} onClick={() => window.print()}>
          Download / Print receipt
        </Button>
      </div>

      <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(20,38,84,0.08)] print:rounded-none print:border-0 print:shadow-none">
        {/* Header band */}
        <header className="relative overflow-hidden bg-gradient-to-br from-ds-navy via-ds-deep to-ds-royal px-8 py-7 text-white print:bg-ds-navy">
          <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-ds-sky/25" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-white p-1.5 shadow-lg">
                <img src="/drivesync_logo.png" alt="DriveSync logo" className="h-full w-full object-contain" />
              </span>
              <div>
                <p className="text-xl font-extrabold tracking-tight">
                  Drive<span className="text-ds-cyan">Sync</span>
                </p>
                <p className="text-xs text-white/65">Online Vehicle Rental Management System</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Payment receipt</p>
              <p className="mt-1 font-mono text-sm font-semibold">{r.receiptNumber}</p>
            </div>
          </div>
        </header>

        <div className="px-8 py-7">
          {/* Amount banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-ds-surface px-5 py-4">
            <div className="flex items-center gap-3">
              <span className={`grid h-11 w-11 place-items-center rounded-full ${refunded ? 'bg-violet-100 text-violet-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {refunded ? <RotateCcw className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
              </span>
              <div>
                <p className="text-xs text-ds-muted">{refunded ? 'Net amount after refund' : 'Amount paid'}</p>
                <p className="text-2xl font-bold text-ds-ink tabular-nums">{formatMoney(r.amount.net, r.amount.currency)}</p>
              </div>
            </div>
            <StatusBadge status={r.payment.paymentStatus} />
          </div>

          {/* Details */}
          <div className="mt-7 grid grid-cols-1 gap-8 sm:grid-cols-2">
            <section>
              <h2 className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-ds-royal">Customer</h2>
              <dl className="divide-y divide-slate-100">
                {isOwnReceipt && user?.name && <DetailRow label="Name">{user.name}</DetailRow>}
                {isOwnReceipt && user?.email && <DetailRow label="Email">{user.email}</DetailRow>}
                <DetailRow label="Customer ID" mono>{r.booking.customerId}</DetailRow>
              </dl>

              <h2 className="mb-1 mt-6 text-[11px] font-bold uppercase tracking-[0.16em] text-ds-royal">Booking</h2>
              <dl className="divide-y divide-slate-100">
                <DetailRow label="Booking ID" mono>{r.booking.bookingId}</DetailRow>
                <DetailRow label="Vehicle">{vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : null}</DetailRow>
                <DetailRow label="Vehicle ID" mono>{r.booking.vehicleId}</DetailRow>
              </dl>
            </section>

            <section>
              <h2 className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-ds-royal">Transaction</h2>
              <dl className="divide-y divide-slate-100">
                <DetailRow label="Payment ID" mono>{r.payment.paymentId}</DetailRow>
                <DetailRow label="Transaction ref." mono>{r.payment.transactionReference}</DetailRow>
                <DetailRow label="Payment date">{formatDateTime(r.payment.paymentDate)}</DetailRow>
                <DetailRow label="Method">{r.payment.paymentMethod}</DetailRow>
                <DetailRow label="Status">{r.payment.paymentStatus}</DetailRow>
              </dl>
            </section>
          </div>

          {/* Breakdown */}
          <section className="mt-7">
            <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ds-royal">Payment breakdown</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs text-ds-muted">
                  <th className="py-2 font-medium">Description</th>
                  <th className="py-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 text-ds-ink">{r.payment.paymentType}</td>
                  <td className="py-3 text-right font-medium tabular-nums">{formatMoney(r.amount.paid, r.amount.currency)}</td>
                </tr>
                {refunded && (
                  <tr>
                    <td className="py-3 text-ds-ink">
                      Refund <span className="text-xs text-ds-muted">({r.refund?.refundReason}, {formatDateTime(r.refund?.refundDate)})</span>
                    </td>
                    <td className="py-3 text-right font-medium text-violet-600 tabular-nums">− {formatMoney(r.amount.refunded, r.amount.currency)}</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-ds-ink/80">
                  <td className="pt-3 font-bold text-ds-ink">Total</td>
                  <td className="pt-3 text-right text-lg font-bold text-ds-ink tabular-nums">{formatMoney(r.amount.net, r.amount.currency)}</td>
                </tr>
              </tfoot>
            </table>
            {refunded && r.refund?.refundReference && <p className="mt-2 text-xs text-ds-muted">Refund reference: <span className="font-mono">{r.refund.refundReference}</span></p>}
          </section>

          <footer className="mt-8 border-t border-dashed border-slate-200 pt-5 text-center text-xs text-ds-muted">
            <p>{r.note}</p>
            <p className="mt-1">Issued {formatDateTime(r.issuedAt)} · {r.issuedBy}</p>
          </footer>
        </div>
      </article>
    </div>
  );
}
