// =============================================================
//  Vehicle details   GET /api/fleet/vehicles/:vehicleId
//  Shows details, last rental return, recent maintenance and status history
// =============================================================
import { Pencil, ArrowLeftRight, Wrench, History, Undo2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import StatusBadge from '../ui/StatusBadge';
import { DetailRow } from '../ui/PageHeader';
import { Spinner, ErrorState } from '../ui/States';
import useAsync from '../../hooks/useAsync';
import { getVehicle } from '../../api/fleetApi';
import { formatDate, formatDateTime, formatMoney } from '../../utils/format';

export default function VehicleDetailsModal({ vehicleId, onClose, onEdit, onChangeStatus }) {
  const { data, loading, error, reload } = useAsync(() => (vehicleId ? getVehicle(vehicleId) : Promise.resolve(null)), [vehicleId]);
  const v = data?.data;

  return (
    <Modal
      open={!!vehicleId}
      onClose={onClose}
      size="xl"
      title={v ? v.vehicleName : 'Vehicle details'}
      subtitle={v ? `${v.registrationNumber} · ${v.vehicleId}` : vehicleId}
      footer={
        v && (
          <>
            <Button variant="secondary" icon={ArrowLeftRight} onClick={() => onChangeStatus(v)}>
              Update status
            </Button>
            <Button icon={Pencil} onClick={() => onEdit(v)}>
              Edit vehicle
            </Button>
          </>
        )
      }
    >
      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {v && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              <StatusBadge status={v.currentStatus} />
              <StatusBadge status={v.condition} />
            </div>
            <dl className="divide-y divide-slate-100">
              <DetailRow label="Mileage">{(v.mileage ?? 0).toLocaleString()} km</DetailRow>
              <DetailRow label="Last maintenance">{formatDate(v.lastMaintenanceDate)}</DetailRow>
              <DetailRow label="Next maintenance">
                <span className={v.nextMaintenanceDate && new Date(v.nextMaintenanceDate) <= new Date() ? 'text-rose-600' : ''}>{formatDate(v.nextMaintenanceDate)}</span>
              </DetailRow>
              <DetailRow label="Registered">{formatDate(v.createdAt)}</DetailRow>
            </dl>

            {v.lastReturn?.bookingId && (
              <div className="mt-5 rounded-xl bg-ds-surface p-4">
                <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-ds-ink">
                  <Undo2 className="h-4 w-4 text-ds-royal" /> Last rental return
                </p>
                <dl className="divide-y divide-slate-200/70">
                  <DetailRow label="Booking" mono>{v.lastReturn.bookingId}</DetailRow>
                  <DetailRow label="Returned">{formatDateTime(v.lastReturn.returnedAt)}</DetailRow>
                  <DetailRow label="Condition">{v.lastReturn.conditionOnReturn}</DetailRow>
                  {v.lastReturn.notes && <DetailRow label="Notes">{v.lastReturn.notes}</DetailRow>}
                </dl>
              </div>
            )}

            <p className="mb-2 mt-5 flex items-center gap-2 text-sm font-semibold text-ds-ink">
              <Wrench className="h-4 w-4 text-ds-royal" /> Recent maintenance
            </p>
            {v.maintenanceHistory?.length ? (
              <ul className="space-y-2">
                {v.maintenanceHistory.map((m) => (
                  <li key={m.maintenanceId} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium text-ds-ink">{m.maintenanceType}</p>
                      <p className="truncate text-xs text-ds-muted">
                        {formatDate(m.startDate)} · {formatMoney(m.cost)}
                      </p>
                    </div>
                    <StatusBadge status={m.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ds-muted">No maintenance recorded.</p>
            )}
          </div>

          <div>
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ds-ink">
              <History className="h-4 w-4 text-ds-royal" /> Status history
            </p>
            <ol className="relative max-h-[420px] space-y-4 overflow-y-auto border-l-2 border-slate-100 pl-5">
              {[...(v.statusHistory || [])].reverse().map((h, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white bg-ds-royal ring-2 ring-ds-royal/20" />
                  <div className="flex flex-wrap items-center gap-1.5">
                    {h.from && <StatusBadge status={h.from} />}
                    {h.from && <span className="text-ds-muted">→</span>}
                    <StatusBadge status={h.to} />
                  </div>
                  <p className="mt-1 text-xs text-ds-muted">{formatDateTime(h.changedAt)}</p>
                  {h.reason && <p className="mt-0.5 text-sm text-ds-ink">{h.reason}</p>}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </Modal>
  );
}
