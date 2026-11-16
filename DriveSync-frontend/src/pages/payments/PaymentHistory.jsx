// =============================================================
//  Payment History
//  Admin:    GET /api/payments?search&status&type&method&page   (all customers)
//  Customer: GET /api/payments/customer/:myId?...               (own payments only)
//  Admin can also confirm or reject Pending (cash) payments.
// =============================================================
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, ReceiptText, CheckCircle2, XCircle, CreditCard, History } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import SearchFilterBar, { FilterSelect } from '../../components/ui/SearchFilterBar';
import Modal, { ConfirmDialog } from '../../components/ui/Modal';
import { DetailRow } from '../../components/ui/PageHeader';
import { Textarea } from '../../components/ui/FormField';
import useAsync from '../../hooks/useAsync';
import useDebounce from '../../hooks/useDebounce';
import { listPayments, getPaymentsByCustomer, updatePaymentStatus } from '../../api/paymentApi';
import { getErrorMessage } from '../../api/httpClient';
import { getUser, isAdmin } from '../../utils/auth';
import { PAYMENT_STATUSES, PAYMENT_TYPES, PAYMENT_METHODS } from '../../config/appConfig';
import { formatMoney, formatDateTime, shortId } from '../../utils/format';

export default function PaymentHistory() {
  const user = getUser();
  const admin = isAdmin(user);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // Filters (status can come from the dashboard: /payments/history?status=Pending)
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(params.get('status') || '');
  const [type, setType] = useState('');
  const [method, setMethod] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search.trim());

  const query = { search: debouncedSearch, status, type, method, page, limit: 10 };
  const { data, loading, error, reload } = useAsync(
    () => (admin ? listPayments(query) : getPaymentsByCustomer(user.id, query)),
    [debouncedSearch, status, type, method, page]
  );

  // Reset to page 1 whenever a filter changes
  const withReset = (setter) => (value) => {
    setter(value);
    setPage(1);
  };
  const hasFilters = search || status || type || method;

  // ---------- Details & admin status change ----------
  const [viewing, setViewing] = useState(null);
  const [statusAction, setStatusAction] = useState(null); // { payment, status }
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const confirmStatus = async () => {
    setSaving(true);
    try {
      const res = await updatePaymentStatus(statusAction.payment.paymentId, { status: statusAction.status, ...(note.trim() && { note: note.trim() }) });
      toast.success(res.message || `Payment marked as ${statusAction.status}`);
      setStatusAction(null);
      setViewing(null);
      setNote('');
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'paymentId', header: 'Payment ID', render: (p) => <span className="font-mono text-xs font-semibold text-ds-ink">{p.paymentId}</span> },
    { key: 'bookingId', header: 'Booking ID', render: (p) => <span className="font-mono text-xs text-ds-muted" title={p.bookingId}>{shortId(p.bookingId)}</span> },
    ...(admin ? [{ key: 'customerId', header: 'Customer ID', render: (p) => <span className="font-mono text-xs text-ds-muted" title={p.customerId}>{shortId(p.customerId)}</span> }] : []),
    { key: 'amount', header: 'Amount', align: 'right', render: (p) => <span className="font-semibold tabular-nums">{formatMoney(p.amount, p.currency)}</span> },
    { key: 'paymentType', header: 'Type', render: (p) => <span className="text-sm">{p.paymentType}</span> },
    { key: 'paymentMethod', header: 'Method', render: (p) => <span className="text-sm text-ds-muted">{p.paymentMethod}</span> },
    { key: 'paymentDate', header: 'Date', render: (p) => <span className="text-sm text-ds-muted whitespace-nowrap">{formatDateTime(p.paymentDate)}</span> },
    { key: 'paymentStatus', header: 'Status', render: (p) => <StatusBadge status={p.paymentStatus} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (p) => (
        <div className="flex justify-end gap-1">
          <Button size="icon" variant="ghost" title="View details" aria-label="View details" onClick={() => setViewing(p)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={ReceiptText}
            disabled={!p.receiptNumber}
            title={p.receiptNumber ? 'View receipt' : 'Receipts exist only for successful payments'}
            onClick={() => navigate(`/payments/${p.paymentId}/receipt`)}
          >
            Receipt
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={['Finance', admin ? 'Payment History' : 'My Payments']}
        title={admin ? 'Payment History' : 'My Payments'}
        subtitle={admin ? 'Every transaction recorded by the Payment Service.' : 'All your rental payments and deposits.'}
        actions={
          <Button icon={CreditCard} onClick={() => navigate('/payments/checkout')}>
            New payment
          </Button>
        }
      />

      <Card bodyClassName="p-0">
        <SearchFilterBar
          search={search}
          onSearchChange={withReset(setSearch)}
          searchPlaceholder="Search payment, booking, customer or receipt no…"
          showClear={!!hasFilters}
          onClear={() => {
            setSearch('');
            setStatus('');
            setType('');
            setMethod('');
            setPage(1);
          }}
        >
          <FilterSelect value={status} onChange={withReset(setStatus)} options={PAYMENT_STATUSES} placeholder="All statuses" />
          <FilterSelect value={type} onChange={withReset(setType)} options={PAYMENT_TYPES} placeholder="All types" />
          <FilterSelect value={method} onChange={withReset(setMethod)} options={PAYMENT_METHODS} placeholder="All methods" />
        </SearchFilterBar>

        <DataTable
          columns={columns}
          rows={data?.data}
          rowKey="paymentId"
          loading={loading}
          error={error}
          onRetry={reload}
          emptyTitle={hasFilters ? 'No matching payments' : 'No payments yet'}
          emptyMessage={hasFilters ? 'Try a different search or clear the filters.' : 'Payments appear here after checkout.'}
        />
        {!loading && !error && <Pagination pagination={data?.pagination} onPageChange={setPage} />}
      </Card>

      {/* ---------- Details modal ---------- */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title="Payment details"
        subtitle={viewing?.paymentId}
        size="lg"
        footer={
          <>
            {admin && viewing?.paymentStatus === 'Pending' && (
              <>
                <Button variant="danger" icon={XCircle} onClick={() => setStatusAction({ payment: viewing, status: 'Failed' })}>
                  Mark failed
                </Button>
                <Button variant="success" icon={CheckCircle2} onClick={() => setStatusAction({ payment: viewing, status: 'Successful' })}>
                  Confirm received
                </Button>
              </>
            )}
            {viewing?.receiptNumber && (
              <Button icon={ReceiptText} onClick={() => navigate(`/payments/${viewing.paymentId}/receipt`)}>
                View receipt
              </Button>
            )}
          </>
        }
      >
        {viewing && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <dl className="divide-y divide-slate-100">
              <DetailRow label="Status"><StatusBadge status={viewing.paymentStatus} /></DetailRow>
              <DetailRow label="Amount">{formatMoney(viewing.amount, viewing.currency)}</DetailRow>
              <DetailRow label="Type">{viewing.paymentType}</DetailRow>
              <DetailRow label="Method">{viewing.paymentMethod}</DetailRow>
              <DetailRow label="Booking ID" mono>{viewing.bookingId}</DetailRow>
              <DetailRow label="Customer ID" mono>{viewing.customerId}</DetailRow>
              <DetailRow label="Vehicle ID" mono>{viewing.vehicleId}</DetailRow>
              <DetailRow label="Transaction ref." mono>{viewing.transactionReference}</DetailRow>
              <DetailRow label="Receipt no." mono>{viewing.receiptNumber}</DetailRow>
              {viewing.failureReason && <DetailRow label="Failure reason"><span className="text-rose-600">{viewing.failureReason}</span></DetailRow>}
              {viewing.refund && (
                <DetailRow label="Refunded">
                  {formatMoney(viewing.refund.refundAmount, viewing.currency)} · {viewing.refund.refundReason}
                </DetailRow>
              )}
            </dl>
            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ds-ink">
                <History className="h-4 w-4 text-ds-royal" /> Status history
              </p>
              <ol className="relative space-y-4 border-l-2 border-slate-100 pl-5">
                {(viewing.statusHistory || []).map((h, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white bg-ds-royal ring-2 ring-ds-royal/20" />
                    <StatusBadge status={h.status} />
                    <p className="mt-1 text-xs text-ds-muted">{formatDateTime(h.changedAt)}</p>
                    {h.note && <p className="mt-0.5 text-sm text-ds-ink">{h.note}</p>}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </Modal>

      {/* ---------- Confirm status change ---------- */}
      <ConfirmDialog
        open={!!statusAction}
        onClose={() => setStatusAction(null)}
        onConfirm={confirmStatus}
        loading={saving}
        tone={statusAction?.status === 'Successful' ? 'success' : 'danger'}
        title={statusAction?.status === 'Successful' ? 'Confirm payment received?' : 'Mark payment as failed?'}
        confirmLabel={statusAction?.status === 'Successful' ? 'Yes, confirm' : 'Yes, mark failed'}
        message={
          <>
            Payment <span className="font-mono text-xs">{statusAction?.payment.paymentId}</span> of{' '}
            <strong className="text-ds-ink">{formatMoney(statusAction?.payment.amount)}</strong> will be marked as <strong className="text-ds-ink">{statusAction?.status}</strong>.
            {statusAction?.status === 'Successful' && ' A receipt will be generated.'}
          </>
        }
      >
        <Textarea className="mt-4" name="note" label="Note (optional)" rows={2} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Cash received at the Colombo counter" />
      </ConfirmDialog>
    </>
  );
}
