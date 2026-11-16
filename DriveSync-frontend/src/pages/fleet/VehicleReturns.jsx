// =============================================================
//  Vehicle Return Management (Admin)
//  Rented vehicles:  GET  /api/fleet/vehicles?status=Rented
//  Process return:   POST /api/fleet/vehicles/:vehicleId/return
//     { bookingId, returnDate, condition, mileage, damageNotes, needsMaintenance }
//  Poor/Damaged condition ALWAYS sends the car to Under Maintenance
//  (the backend also opens a repair/inspection job automatically).
// =============================================================
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Car, Undo2, CheckCircle2, Wrench, Search, KeyRound, ArrowRight, RotateCcw } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/FormField';
import { Spinner, EmptyState, ErrorState } from '../../components/ui/States';
import useAsync from '../../hooks/useAsync';
import { listVehicles, getVehicle, returnVehicle } from '../../api/fleetApi';
import { getErrorMessage } from '../../api/httpClient';
import { VEHICLE_CONDITIONS } from '../../config/appConfig';
import { todayInput, formatDate } from '../../utils/format';
import { validate, required, isMongoId, isNotFutureDay } from '../../utils/validators';

const NEEDS_ATTENTION = ['Poor', 'Damaged'];
const EMPTY = { bookingId: '', returnDate: todayInput(), mileage: '', condition: 'Good', damageNotes: '', decision: 'Available' };

export default function VehicleReturns() {
  const rented = useAsync(() => listVehicles({ status: 'Rented', limit: 100 }), []);
  const [vehicle, setVehicle] = useState(null);
  const [lookup, setLookup] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [looking, setLooking] = useState(false);

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  const forcedMaintenance = NEEDS_ATTENTION.includes(form.condition);
  // Poor / Damaged -> the decision is forced to Under Maintenance (calculated, not stored)
  const decision = forcedMaintenance ? 'Under Maintenance' : form.decision;

  const choose = (v) => {
    setVehicle(v);
    setForm({ ...EMPTY, mileage: String(v.mileage ?? '') });
    setErrors({});
    setResult(null);
  };

  // Enter a vehicle ID manually
  const findById = async () => {
    if (!isMongoId(lookup)) return setLookupError('Vehicle ID must be 24 hexadecimal characters');
    setLooking(true);
    setLookupError('');
    try {
      const res = await getVehicle(lookup.trim());
      if (res.data.currentStatus !== 'Rented') setLookupError(`This vehicle is ${res.data.currentStatus}. Only Rented vehicles can be returned.`);
      else choose(res.data);
    } catch (err) {
      setLookupError(getErrorMessage(err));
    } finally {
      setLooking(false);
    }
  };

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const review = (e) => {
    e.preventDefault();
    const found = validate(form, {
      bookingId: [required('Booking ID is required'), [isMongoId, 'Booking ID must be 24 hexadecimal characters']],
      returnDate: [required('Return date is required'), [isNotFutureDay, 'Return date cannot be in the future']],
      mileage: [
        required('Odometer reading is required'),
        [(v) => Number.isInteger(Number(v)) && Number(v) >= 0, 'Mileage must be a whole number'],
        [(v) => Number(v) >= (vehicle.mileage ?? 0), `Cannot be lower than the current ${(vehicle.mileage ?? 0).toLocaleString()} km`],
      ],
      damageNotes: [[(v, all) => !NEEDS_ATTENTION.includes(all.condition) || v.trim().length >= 5, 'Describe the damage / issue (at least 5 characters)']],
    });
    setErrors(found);
    if (Object.keys(found).length === 0) setConfirming(true);
  };

  const submit = async () => {
    setSaving(true);
    try {
      const res = await returnVehicle(vehicle.vehicleId, {
        bookingId: form.bookingId.trim(),
        returnDate: form.returnDate,
        condition: form.condition,
        mileage: Number(form.mileage),
        needsMaintenance: decision === 'Under Maintenance',
        ...(form.damageNotes.trim() && { damageNotes: form.damageNotes.trim() }),
      });
      toast.success(res.message || 'Return processed', { duration: 5000 });
      setResult(res.data);
      setConfirming(false);
      setVehicle(null);
      rented.reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setConfirming(false);
    } finally {
      setSaving(false);
    }
  };

  const rentedList = rented.data?.data || [];

  return (
    <>
      <PageHeader breadcrumb={['Fleet Operations', 'Returns']} title="Vehicle Return Management" subtitle="Inspect returned vehicles, record their condition and decide what happens next." />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">
        {/* ---------- Choose vehicle ---------- */}
        <Card title="Rented vehicles" subtitle="Select the vehicle being returned" icon={KeyRound} bodyClassName="p-5 pt-4">
          <div className="mb-4 flex gap-2">
            <Input
              className="flex-1"
              name="lookup"
              placeholder="Or enter vehicle ID…"
              value={lookup}
              onChange={(e) => {
                setLookup(e.target.value);
                setLookupError('');
              }}
              error={lookupError}
            />
            <Button variant="dark" size="icon" className="mt-1 h-10! w-11!" aria-label="Find vehicle" onClick={findById} loading={looking}>
              {!looking && <Search className="h-4 w-4" />}
            </Button>
          </div>

          {rented.loading ? (
            <Spinner />
          ) : rented.error ? (
            <ErrorState message={rented.error} onRetry={rented.reload} />
          ) : rentedList.length === 0 ? (
            <EmptyState icon={Car} title="No rented vehicles" message="Vehicles appear here while they are out with customers." />
          ) : (
            <ul className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
              {rentedList.map((v) => (
                <li key={v.vehicleId}>
                  <button
                    onClick={() => choose(v)}
                    className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition ${vehicle?.vehicleId === v.vehicleId ? 'border-ds-royal bg-ds-royal/5' : 'border-slate-200 hover:border-ds-royal/40'}`}
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ds-surface text-ds-royal">
                      <Car className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ds-ink">{v.vehicleName}</span>
                      <span className="block font-mono text-xs text-ds-muted">{v.registrationNumber}</span>
                    </span>
                    <StatusBadge status={v.currentStatus} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* ---------- Return form / result ---------- */}
        <div>
          {result ? (
            <Card bodyClassName="p-8 text-center">
              {result.maintenanceRecord ? (
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-rose-100 text-rose-600">
                  <Wrench className="h-8 w-8" />
                </span>
              ) : (
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </span>
              )}
              <h2 className="mt-4 text-xl font-bold text-ds-ink">Return processed</h2>
              <p className="mt-1 text-sm text-ds-muted">
                {result.vehicle.vehicleName} ({result.vehicle.registrationNumber}) is now
              </p>
              <div className="mt-3 flex justify-center gap-2">
                <StatusBadge status={result.vehicle.currentStatus} />
                <StatusBadge status={result.vehicle.condition} />
              </div>
              {result.maintenanceRecord && (
                <p className="mx-auto mt-4 max-w-md rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                  Maintenance job <span className="font-mono font-semibold">{result.maintenanceRecord.maintenanceId}</span> ({result.maintenanceRecord.maintenanceType}) was opened automatically.
                </p>
              )}
              <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
                <Button variant="secondary" icon={RotateCcw} onClick={() => setResult(null)}>
                  Process another return
                </Button>
                {result.maintenanceRecord ? (
                  <Link to="/fleet/maintenance?status=In%20Progress">
                    <Button icon={ArrowRight} className="w-full">Go to maintenance</Button>
                  </Link>
                ) : (
                  <Link to="/payments/refunds">
                    <Button icon={ArrowRight} className="w-full">Refund security deposit</Button>
                  </Link>
                )}
              </div>
            </Card>
          ) : !vehicle ? (
            <Card bodyClassName="p-0">
              <EmptyState icon={Undo2} title="Select a vehicle" message="Choose a rented vehicle on the left (or enter its ID) to record the return." />
            </Card>
          ) : (
            <Card title={`Return: ${vehicle.vehicleName}`} subtitle={`${vehicle.registrationNumber} · current mileage ${(vehicle.mileage ?? 0).toLocaleString()} km`} icon={Undo2}>
              <form onSubmit={review} noValidate className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input label="Booking ID" name="bookingId" required value={form.bookingId} onChange={set('bookingId')} error={errors.bookingId} placeholder="24-character booking ID" />
                <Input label="Return date" name="returnDate" type="date" required max={todayInput()} value={form.returnDate} onChange={set('returnDate')} error={errors.returnDate} />
                <Input label="Odometer reading (km)" name="mileage" type="number" min={vehicle.mileage ?? 0} required value={form.mileage} onChange={set('mileage')} error={errors.mileage} />
                <Select label="Vehicle condition" name="condition" required options={VEHICLE_CONDITIONS} value={form.condition} onChange={set('condition')} />
                <Textarea
                  className="md:col-span-2"
                  label="Damage / inspection notes"
                  name="damageNotes"
                  required={forcedMaintenance}
                  maxLength={1000}
                  value={form.damageNotes}
                  onChange={set('damageNotes')}
                  error={errors.damageNotes}
                  placeholder={forcedMaintenance ? 'Describe the damage, e.g. Rear bumper scratched, left mirror cracked' : 'Optional notes, e.g. Fuel tank full, interior clean'}
                />

                <fieldset className="md:col-span-2">
                  <legend className="mb-2 text-sm font-medium text-ds-ink">After this return the vehicle should be</legend>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {[
                      { value: 'Available', icon: CheckCircle2, text: 'Ready for the next rental', tone: 'emerald' },
                      { value: 'Under Maintenance', icon: Wrench, text: 'Send for inspection / repair (a job is opened)', tone: 'rose' },
                    ].map(({ value, icon: Icon, text, tone }) => {
                      const active = decision === value;
                      const disabled = value === 'Available' && forcedMaintenance;
                      return (
                        <label
                          key={value}
                          className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition ${disabled ? 'cursor-not-allowed opacity-45' : ''} ${
                            active ? (tone === 'emerald' ? 'border-emerald-500 bg-emerald-50' : 'border-rose-500 bg-rose-50') : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <input type="radio" name="decision" value={value} checked={active} disabled={disabled} onChange={set('decision')} className="sr-only" />
                          <Icon className={`mt-0.5 h-5 w-5 ${tone === 'emerald' ? 'text-emerald-600' : 'text-rose-600'}`} />
                          <span>
                            <span className="block text-sm font-semibold text-ds-ink">{value}</span>
                            <span className="block text-xs text-ds-muted">{disabled ? 'Not allowed for Poor / Damaged vehicles' : text}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                {vehicle.nextMaintenanceDate && new Date(vehicle.nextMaintenanceDate) <= new Date() && (
                  <p className="md:col-span-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
                    Heads up: this vehicle’s scheduled service was due on {formatDate(vehicle.nextMaintenanceDate)}. Consider sending it for maintenance.
                  </p>
                )}

                <div className="flex flex-col-reverse gap-2 md:col-span-2 sm:flex-row sm:justify-end">
                  <Button variant="secondary" onClick={() => setVehicle(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" icon={Undo2}>
                    Process return
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={submit}
        loading={saving}
        tone={decision === 'Under Maintenance' ? 'warning' : 'success'}
        title="Confirm vehicle return"
        confirmLabel="Confirm return"
        message={
          <>
            <strong className="text-ds-ink">{vehicle?.registrationNumber}</strong> returned in <strong className="text-ds-ink">{form.condition}</strong> condition at{' '}
            {Number(form.mileage || 0).toLocaleString()} km. It will be marked <strong className="text-ds-ink">{decision}</strong>.
          </>
        }
      />
    </>
  );
}
