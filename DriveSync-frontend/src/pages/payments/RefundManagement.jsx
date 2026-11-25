// =============================================================
//  Refund Management (Admin)
//  "Eligible" tab : GET /api/payments?status=Successful
//  "Refunded" tab : GET /api/payments?status=Refunded
//  Refund         : POST /api/payments/:paymentId/refund  { refundAmount, refundReason }
// =============================================================
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { RotateCcw, Undo2, BadgeCheck, Eye } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import SearchFilterBar, { FilterSelect } from '../../components/ui/SearchFilterBar';
import Modal, { ConfirmDialog } from '../../components/ui/Modal';
import { DetailRow } from '../../components/ui/PageHeader';
import { Input, Textarea } from '../../components/ui/FormField';
import useAsync from '../../hooks/useAsync';
import useDebounce from '../../hooks/useDebounce';
import { listPayments, refundPayment } from '../../api/paymentApi';
import { getErrorMessage } from '../../api/httpClient';
import { PAYMENT_TYPES, CURRENCY } from '../../config/appConfig';
import { formatMoney, formatDateTime, shortId } from '../../utils/format';
import { validate, required, isMoney } from '../../utils/validators';

const TABS = [
  { key: 'Successful', label: 'Eligible for refund', icon: Undo2 },
  { key: 'Refunded', label: 'Refunded', icon: BadgeCheck },
];

export default function RefundManagement() {
  const [tab, setTab] = useState('Successful');
  const [search, setSearch] = useState('');
  const [type, setType] = useState('Security Deposit'); // deposits are the most common refunds
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search.trim());

  const { data, loading, error, reload } = useAsync(
    () => listPayments({ status: tab, type, search: debounced, page, limit: 10 }),
    [tab, type, debounced, page]
  );

  // ---------- Refund form ----------
  const [target, setTarget] = useState(null);
  const [form, setForm] = useState({ refundAmount: '', refundReason: '' });
  const [errors, setErrors] = useState({});
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewing, setViewing] = useState(null);

  const openRefund = (payment) => {
    setTarget(payment);
    setForm({ refundAmount: String(payment.amount), refundReason: '' });
    setErrors({});
  };

  const reviewRefund = () => {
    const found = validate(form, {
      refundAmount: [
        required('Refund amount is required'),
        [isMoney, 'Enter a positive amount (max 2 decimals)'],
        [(v) => Number(v) <= target.amount, `Cannot refund more than ${formatMoney(target.amount)}`],
      ],
      refundReason: [required('Please give a reason for the refund'), [(v) => v.trim().length >= 5, 'Reason must be at least 5 characters']],
    });
    setErrors(found);
    if (Object.keys(found).length === 0) setConfirming(true);
  };

  const submitRefund = async () => {
    setSaving(true);
    try {
      const res = await refundPayment(target.paymentId, { refundAmount: Number(form.refundAmount), refundReason: form.refundReason.trim() });
      toast.success(`${res.message || 'Refund processed'} · ${res.data.refund.refundReference}`);
      setConfirming(false);
      setTarget(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setConfirming(false);
    } finally {
      setSaving(false);
    }
  };

  const isPartial = target && Number(form.refundAmount) < target.amount;

  const baseColumns = [
    { key: 'paymentId', header: 'Payment ID', render: (p) => <span className="font-mono text-xs font-semibold">{p.paymentId}</span> },
    { key: 'bookingId', header: 'Booking', render: (p) => <span className="font-mono text-xs text-ds-muted" title={p.bookingId}>{shortId(p.bookingId)}</span> },
    { key: 'customerId', header: 'Customer', render: (p) => <span className="font-mono text-xs text-ds-muted" title={p.customerId}>{shortId(p.customerId)}</span> },
    { key: 'paymentType', header: 'Type' },
    { key: 'amount', header: 'Paid', align: 'right', render: (p) => <span className="font-semibold tabular-nums">{formatMoney(p.amount, p.currency)}</span> },
  ];

  const columns =
    tab === 'Successful'
      ? [
          ...baseColumns,
          { key: 'paymentDate', header: 'Paid on', render: (p) => <span className="text-ds-muted">{formatDateTime(p.paymentDate)}</span> },
          { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.paymentStatus} /> },
          {
            key: 'actions',
            header: '',
            align: 'right',
            render: (p) => (
              <Button size="sm" variant="secondary" icon={RotateCcw} onClick={() => openRefund(p)}>
                Refund
              </Button>
            ),
          },
        ]
      : [
          ...baseColumns,
          { key: 'refund', header: 'Refunded', align: 'right', render: (p) => <span className="font-semibold text-violet-600 tabular-nums">{formatMoney(p.refund?.refundAmount, p.currency)}</span> },
          { key: 'refundDate', header: 'Refund date', render: (p) => <span className="text-ds-muted">{formatDateTime(p.refund?.refundDate)}</span> },
          { key: 'status', header: 'Refund status', render: (p) => <StatusBadge status={p.paymentStatus} /> },
          {
            key: 'actions',
            header: '',
            align: 'right',
            render: (p) => (
              <Button size="icon" variant="ghost" aria-label="View refund" onClick={() => setViewing(p)}>
                <Eye className="h-4 w-4" />
              </Button>
            ),
          },
        ];

  return (
    <>
      <PageHeader breadcrumb={['Finance', 'Refunds']} title="Refund Management" subtitle="Return security deposits or refund rental payments (simulated gateway)." />

      <Card bodyClassName="p-0">
        <div className="flex gap-1 border-b border-slate-100 px-5 pt-4">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => {
                setTab(key);
                setPage(1);
              }}
              className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                tab === key ? 'border-ds-royal text-ds-royal' : 'border-transparent text-ds-muted hover:text-ds-ink'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        <SearchFilterBar
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder="Search payment, booking or customer ID…"
        >
          <FilterSelect
            value={type}
            onChange={(v) => {
              setType(v);
              setPage(1);
            }}
            options={PAYMENT_TYPES}
            placeholder="All payment types"
          />
        </SearchFilterBar>

        <DataTable
          columns={columns}
          rows={data?.data}
          rowKey="paymentId"
          loading={loading}
          error={error}
          onRetry={reload}
          emptyTitle={tab === 'Successful' ? 'No refundable payments' : 'No refunds yet'}
          emptyMessage={tab === 'Successful' ? 'Only Successful payments can be refunded.' : 'Processed refunds will be listed here.'}
        />
        {!loading && !error && <Pagination pagination={data?.pagination} onPageChange={setPage} />}
      </Card>

      {/* ---------- Refund form ---------- */}
      <Modal
        open={!!target && !confirming}
        onClose={() => setTarget(null)}
        title="Initiate refund"
        subtitle={target?.paymentId}
        footer={
          <>
            <Button variant="secondary" onClick={() => setTarget(null)}>
              Cancel
            </Button>
            <Button variant="warning" icon={RotateCcw} onClick={reviewRefund}>
              Review refund
            </Button>
          </>
        }
      >
        {target && (
          <>
            <dl className="mb-5 divide-y divide-slate-100 rounded-xl bg-ds-surface px-4">
              <DetailRow label="Payment type">{target.paymentType}</DetailRow>
              <DetailRow label="Method">{target.paymentMethod}</DetailRow>
              <DetailRow label="Amount paid">{formatMoney(target.amount, target.currency)}</DetailRow>
              <DetailRow label="Booking ID" mono>{target.bookingId}</DetailRow>
              <DetailRow label="Customer ID" mono>{target.customerId}</DetailRow>
            </dl>
            <div className="space-y-4">
              <Input
                label="Refund amount"
                name="refundAmount"
                type="number"
                step="0.01"
                min="0"
                prefix={CURRENCY}
                required
                value={form.refundAmount}
                onChange={(e) => setForm((f) => ({ ...f, refundAmount: e.target.value }))}
                error={errors.refundAmount}
                hint="Full amount by default. Lower it for a partial refund (e.g. deposit minus damage charge)."
              />
              <Textarea
                label="Refund reason"
                name="refundReason"
                required
                maxLength={500}
                value={form.refundReason}
                onChange={(e) => setForm((f) => ({ ...f, refundReason: e.target.value }))}
                error={errors.refundReason}
                placeholder="e.g. Vehicle returned in good condition: full deposit returned"
              />
            </div>
          </>
        )}
      </Modal>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={submitRefund}
        loading={saving}
        tone="warning"
        title="Confirm refund"
        confirmLabel="Process refund"
        message={
          <>
            Refund <strong className="text-ds-ink">{formatMoney(Number(form.refundAmount))}</strong> {isPartial ? '(partial)' : '(full)'} for payment{' '}
            <span className="font-mono text-xs">{target?.paymentId}</span>? This cannot be undone and the payment will be marked as <strong className="text-ds-ink">Refunded</strong>.
          </>
        }
      />

      {/* ---------- Refund details ---------- */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Refund details" subtitle={viewing?.paymentId} size="sm">
        {viewing?.refund && (
          <dl className="divide-y divide-slate-100">
            <DetailRow label="Status"><StatusBadge status={viewing.paymentStatus} /></DetailRow>
            <DetailRow label="Amount paid">{formatMoney(viewing.amount, viewing.currency)}</DetailRow>
            <DetailRow label="Refunded">{formatMoney(viewing.refund.refundAmount, viewing.currency)}</DetailRow>
            <DetailRow label="Kept">{formatMoney(viewing.amount - viewing.refund.refundAmount, viewing.currency)}</DetailRow>
            <DetailRow label="Reason">{viewing.refund.refundReason}</DetailRow>
            <DetailRow label="Reference" mono>{viewing.refund.refundReference}</DetailRow>
            <DetailRow label="Refund date">{formatDateTime(viewing.refund.refundDate)}</DetailRow>
          </dl>
        )}
      </Modal>
    </>
  );
}
