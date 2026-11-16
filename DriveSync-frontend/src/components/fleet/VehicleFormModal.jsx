// =============================================================
//  Add / Edit vehicle form
//  Add:  POST  /api/fleet/vehicles
//  Edit: PATCH /api/fleet/vehicles/:vehicleId
//  "Pick from catalog" reads Member 2's Catalog Service so the fleet
//  uses the SAME vehicleId as the catalog (shared ID, separate databases).
// =============================================================
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Save, Library } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Input, Select } from '../ui/FormField';
import useAsync from '../../hooks/useAsync';
import { registerVehicle, updateVehicle } from '../../api/fleetApi';
import { getCatalogVehicles } from '../../api/bookingApi';
import { getErrorMessage } from '../../api/httpClient';
import { VEHICLE_CONDITIONS } from '../../config/appConfig';
import { toDateInput } from '../../utils/format';
import { validate, required, isMongoId, isRegistrationNumber } from '../../utils/validators';

const EMPTY = { vehicleId: '', vehicleName: '', registrationNumber: '', currentStatus: 'Available', condition: 'Good', mileage: '', lastMaintenanceDate: '', nextMaintenanceDate: '' };

// Start values: empty for "add", the vehicle's current values for "edit"
const initialForm = (vehicle) =>
  vehicle
    ? {
        ...EMPTY,
        vehicleId: vehicle.vehicleId,
        vehicleName: vehicle.vehicleName,
        registrationNumber: vehicle.registrationNumber,
        condition: vehicle.condition,
        mileage: String(vehicle.mileage ?? ''),
        nextMaintenanceDate: toDateInput(vehicle.nextMaintenanceDate),
      }
    : EMPTY;

// The parent only renders this while open, with a key, so the form always starts fresh.
export default function VehicleFormModal({ onClose, vehicle, onSaved }) {
  const editing = !!vehicle;
  const [form, setForm] = useState(() => initialForm(vehicle));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const catalog = useAsync(() => (editing ? Promise.resolve(null) : getCatalogVehicles()), [editing]);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const pickCatalog = (id) => {
    const v = (catalog.data?.data || []).find((x) => x._id === id);
    if (v) setForm((f) => ({ ...f, vehicleId: v._id, vehicleName: `${v.brand} ${v.model} ${v.year}` }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const rules = {
      vehicleName: [required('Vehicle name is required'), [(v) => v.trim().length <= 100, 'Max 100 characters']],
      registrationNumber: [required('Registration number is required'), [isRegistrationNumber, 'Use 2-20 letters, numbers, spaces or dashes (e.g. CAB-1234)']],
      mileage: [[(v) => v === '' || (Number.isInteger(Number(v)) && Number(v) >= 0), 'Mileage must be a whole number ≥ 0']],
      nextMaintenanceDate: [[(v, all) => !v || !all.lastMaintenanceDate || new Date(v) > new Date(all.lastMaintenanceDate), 'Must be after the last maintenance date']],
    };
    if (!editing) rules.vehicleId = [required('Vehicle ID is required'), [isMongoId, 'Must be the 24-character Catalog vehicle ID']];
    if (editing) rules.mileage.push([(v) => v === '' || Number(v) >= vehicle.mileage, `Mileage cannot go below ${vehicle.mileage} km`]);

    const found = validate(form, rules);
    setErrors(found);
    if (Object.keys(found).length) return;

    // Only send fields that have a value
    const payload = {
      vehicleName: form.vehicleName.trim(),
      registrationNumber: form.registrationNumber.trim().toUpperCase(),
      condition: form.condition,
      ...(form.mileage !== '' && { mileage: Number(form.mileage) }),
      ...(form.nextMaintenanceDate && { nextMaintenanceDate: form.nextMaintenanceDate }),
    };
    if (!editing) {
      payload.vehicleId = form.vehicleId.trim();
      payload.currentStatus = form.currentStatus;
      if (form.lastMaintenanceDate) payload.lastMaintenanceDate = form.lastMaintenanceDate;
    }

    setSaving(true);
    try {
      const res = editing ? await updateVehicle(vehicle.vehicleId, payload) : await registerVehicle(payload);
      toast.success(res.message || (editing ? 'Vehicle updated' : 'Vehicle registered'));
      onSaved(res.data);
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const catalogOptions = (catalog.data?.data || []).map((v) => ({ value: v._id, label: `${v.brand} ${v.model} ${v.year} · ${v.location}` }));

  return (
    <Modal
      open
      onClose={onClose}
      closeDisabled={saving}
      size="lg"
      title={editing ? 'Edit vehicle' : 'Register vehicle in fleet'}
      subtitle={editing ? vehicle.registrationNumber : 'Adds an existing catalog vehicle to fleet operations'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="vehicle-form" icon={Save} loading={saving}>
            {editing ? 'Save changes' : 'Register vehicle'}
          </Button>
        </>
      }
    >
      <form id="vehicle-form" onSubmit={submit} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {!editing && (
          <div className="sm:col-span-2 rounded-xl border border-dashed border-ds-royal/30 bg-ds-royal/5 p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-ds-ink">
              <Library className="h-4 w-4 text-ds-royal" /> Pick from Catalog Service (optional)
            </p>
            {catalog.error ? (
              <p className="text-xs text-amber-700">Catalog Service unavailable. Enter the vehicle ID manually.</p>
            ) : (
              <Select name="catalogPick" placeholder={catalog.loading ? 'Loading catalog…' : 'Select a catalog vehicle…'} options={catalogOptions} value="" onChange={(e) => pickCatalog(e.target.value)} disabled={catalog.loading} />
            )}
          </div>
        )}

        <Input label="Vehicle ID" name="vehicleId" required={!editing} disabled={editing} value={form.vehicleId} onChange={set('vehicleId')} error={errors.vehicleId} placeholder="24-character catalog ID" hint={editing ? 'The shared ID cannot be changed' : undefined} />
        <Input label="Vehicle name" name="vehicleName" required value={form.vehicleName} onChange={set('vehicleName')} error={errors.vehicleName} placeholder="Toyota Prius 2022" />
        <Input label="Registration number" name="registrationNumber" required value={form.registrationNumber} onChange={set('registrationNumber')} error={errors.registrationNumber} placeholder="CAB-1234" />
        <Select label="Condition" name="condition" value={form.condition} onChange={set('condition')} options={VEHICLE_CONDITIONS} />
        <Input label="Mileage (km)" name="mileage" type="number" min="0" value={form.mileage} onChange={set('mileage')} error={errors.mileage} />
        {!editing && (
          <Select label="Initial status" name="currentStatus" value={form.currentStatus} onChange={set('currentStatus')} options={['Available', 'Under Maintenance', 'Inactive']} />
        )}
        {!editing && <Input label="Last maintenance date" name="lastMaintenanceDate" type="date" value={form.lastMaintenanceDate} onChange={set('lastMaintenanceDate')} />}
        <Input label="Next maintenance date" name="nextMaintenanceDate" type="date" value={form.nextMaintenanceDate} onChange={set('nextMaintenanceDate')} error={errors.nextMaintenanceDate} />
      </form>
    </Modal>
  );
}
