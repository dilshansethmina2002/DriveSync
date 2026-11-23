// =============================================================
//  Change vehicle status   PATCH /api/fleet/vehicles/:vehicleId/status
//  Only shows the statuses that are ALLOWED from the current one
//  (same state machine as the backend), then asks for confirmation.
// =============================================================
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ArrowRight } from 'lucide-react';
import Modal, { ConfirmDialog } from '../ui/Modal';
import Button from '../ui/Button';
import StatusBadge from '../ui/StatusBadge';
import { Textarea } from '../ui/FormField';
import { changeVehicleStatus } from '../../api/fleetApi';
import { getErrorMessage } from '../../api/httpClient';
import { STATUS_TRANSITIONS, VEHICLE_STATUSES } from '../../config/appConfig';

// The parent renders this with key={vehicleId}, so every vehicle gets a fresh, empty form.
export default function StatusChangeModal({ vehicle, onClose, onSaved, presetStatus = '' }) {
  const [status, setStatus] = useState(presetStatus);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!vehicle) return null;
  const allowed = STATUS_TRANSITIONS[vehicle.currentStatus] || [];

  const review = () => {
    if (!status) return setError('Choose the new status');
    if (reason.trim().length < 3) return setError('Please enter a short reason (at least 3 characters)');
    setError('');
    setConfirming(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await changeVehicleStatus(vehicle.vehicleId, status, reason.trim());
      toast.success(res.message || `Status changed to ${status}`);
      onSaved(res.data);
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setConfirming(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Modal
        open={!confirming}
        onClose={onClose}
        title="Update vehicle status"
        subtitle={`${vehicle.vehicleName} · ${vehicle.registrationNumber}`}
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={review}>Continue</Button>
          </>
        }
      >
        <p className="mb-2 text-sm font-medium text-ds-ink">Current status</p>
        <StatusBadge status={vehicle.currentStatus} />

        <p className="mb-2 mt-5 text-sm font-medium text-ds-ink">New status</p>
        <div className="grid grid-cols-2 gap-2">
          {VEHICLE_STATUSES.filter((s) => s !== vehicle.currentStatus).map((s) => {
            const ok = allowed.includes(s);
            return (
              <button
                key={s}
                disabled={!ok}
                onClick={() => setStatus(s)}
                title={ok ? '' : `Not allowed from ${vehicle.currentStatus}`}
                className={`rounded-xl border-2 px-3 py-2.5 text-left text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  status === s ? 'border-ds-royal bg-ds-royal/5 text-ds-royal' : 'border-slate-200 text-ds-ink hover:border-ds-royal/40'
                }`}
              >
                {s}
                {!ok && <span className="block text-[11px] font-normal text-ds-muted">Not allowed</span>}
              </button>
            );
          })}
        </div>

        <Textarea className="mt-5" label="Reason" name="reason" required rows={2} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Customer picked up the car for booking …" />
        {error && <p className="mt-2 text-xs font-medium text-rose-600">{error}</p>}
        {status === 'Available' && vehicle.currentStatus === 'Under Maintenance' && (
          <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">The backend will refuse this if a maintenance job is still In Progress or the vehicle is Damaged.</p>
        )}
      </Modal>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={save}
        loading={saving}
        tone={status === 'Under Maintenance' || status === 'Inactive' ? 'warning' : 'info'}
        title="Confirm status change"
        confirmLabel="Change status"
        message={
          <span className="flex flex-wrap items-center gap-2">
            {vehicle.registrationNumber}: <StatusBadge status={vehicle.currentStatus} /> <ArrowRight className="h-4 w-4" /> <StatusBadge status={status} />
          </span>
        }
      />
    </>
  );
}
