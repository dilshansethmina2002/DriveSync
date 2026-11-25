// =============================================================
//  Maintenance Management (Admin)
//  All jobs:          GET   /api/fleet/maintenance?status&type&page
//  One vehicle:       GET   /api/fleet/vehicles/:vehicleId/maintenance
//  Add record:        POST  /api/fleet/vehicles/:vehicleId/maintenance
//  Complete job:      PATCH /api/fleet/maintenance/:maintenanceId/complete
// =============================================================
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, CheckCircle2, Wrench, Coins, Eye } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import SearchFilterBar, { FilterSelect } from '../../components/ui/SearchFilterBar';
import Modal, { ConfirmDialog } from '../../components/ui/Modal';
import { DetailRow } from '../../components/ui/PageHeader';
import { Input, Select, Textarea, Checkbox } from '../../components/ui/FormField';
import useAsync from '../../hooks/useAsync';
import { listMaintenance, getVehicleMaintenance, recordMaintenance, completeMaintenance, listVehicles } from '../../api/fleetApi';
import { getErrorMessage } from '../../api/httpClient';
import { MAINTENANCE_TYPES, MAINTENANCE_STATUSES, VEHICLE_CONDITIONS, CURRENCY } from '../../config/appConfig';
import { formatMoney, formatDate, todayInput, toDateInput } from '../../utils/format';
import { validate, required, isNotFutureDay, isFutureDay } from '../../utils/validators';

const EMPTY_RECORD = { vehicleId: '', maintenanceType: 'Routine Service', description: '', startDate: todayInput(), cost: '', serviceProvider: '', status: 'In Progress', completedDate: '' };

export default function MaintenanceManagement() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState(params.get('status') || '');
  const [type, setType] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, loading, error, reload } = useAsync(() => {
    const query = { status, type, page, limit: 10 };
    return vehicleFilter ? getVehicleMaintenance(vehicleFilter, query) : listMaintenance(query);
  }, [status, type, vehicleFilter, page]);

  // All vehicles (for the filter and the "add record" form)
  const vehiclesReq = useAsync(() => listVehicles({ limit: 100 }), []);
  const vehicles = useMemo(() => vehiclesReq.data?.data || [], [vehiclesReq.data]);
  const vehicleOptions = vehicles.map((v) => ({ value: v.vehicleId, label: `${v.registrationNumber} · ${v.vehicleName} (${v.currentStatus})` }));

  const reset = (setter) => (v) => {
    setter(v);
    setPage(1);
  };

  // ---------- Add record ----------
  const [addOpen, setAddOpen] = useState(false);
  const [record, setRecord] = useState(EMPTY_RECORD);
  const [recordErrors, setRecordErrors] = useState({});
  const [savingRecord, setSavingRecord] = useState(false);
  const selectedVehicle = vehicles.find((v) => v.vehicleId === record.vehicleId);

  // Open the form with a clean record (pre-select the filtered vehicle, if any)
  const openAdd = () => {
    setRecord({ ...EMPTY_RECORD, vehicleId: vehicleFilter, startDate: todayInput() });
    setRecordErrors({});
    setAddOpen(true);
  };

  const setR = (field) => (e) => {
    setRecord((r) => ({ ...r, [field]: e.target.value }));
    setRecordErrors((er) => ({ ...er, [field]: undefined }));
  };

  const saveRecord = async (e) => {
    e.preventDefault();
    const found = validate(record, {
      vehicleId: [required('Choose a vehicle'), [(v, all) => !(all.status === 'In Progress' && vehicles.find((x) => x.vehicleId === v)?.currentStatus === 'Rented'), 'This vehicle is Rented. Process its return first']],
      description: [required('Description is required'), [(v) => v.trim().length >= 5, 'At least 5 characters']],
      startDate: [required('Maintenance date is required'), [isNotFutureDay, 'Maintenance date cannot be in the future']],
      cost: [[(v) => v === '' || Number(v) >= 0, 'Cost must be 0 or more']],
      completedDate: [[(v, all) => all.status !== 'Completed' || !v || new Date(v) >= new Date(all.startDate), 'Completion date must be on/after the maintenance date']],
    });
    setRecordErrors(found);
    if (Object.keys(found).length) return;

    setSavingRecord(true);
    try {
      const res = await recordMaintenance(record.vehicleId, {
        maintenanceType: record.maintenanceType,
        description: record.description.trim(),
        startDate: record.startDate,
        status: record.status,
        ...(record.cost !== '' && { cost: Number(record.cost) }),
        ...(record.serviceProvider.trim() && { serviceProvider: record.serviceProvider.trim() }),
        ...(record.status === 'Completed' && { completedDate: record.completedDate || record.startDate }),
      });
      toast.success(res.message || 'Maintenance recorded');
      setAddOpen(false);
      reload();
      vehiclesReq.reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingRecord(false);
    }
  };

  // ---------- Complete job ----------
  const [completing, setCompleting] = useState(null);
  const [done, setDone] = useState({});
  const [doneErrors, setDoneErrors] = useState({});
  const [confirmDone, setConfirmDone] = useState(false);
  const [savingDone, setSavingDone] = useState(false);
  const [viewing, setViewing] = useState(null);

  const openComplete = (m) => {
    setCompleting(m);
    const next = new Date();
    next.setDate(next.getDate() + 90);
    setDone({ cost: String(m.cost || ''), completionNotes: '', condition: m.vehicle?.condition === 'Damaged' || m.vehicle?.condition === 'Poor' ? 'Good' : m.vehicle?.condition || 'Good', nextMaintenanceDate: toDateInput(next), makeAvailable: true });
    setDoneErrors({});
  };

  const reviewComplete = () => {
    const found = validate(done, {
      cost: [required('Final cost is required'), [(v) => Number(v) >= 0, 'Cost must be 0 or more']],
      completionNotes: [required('Describe the work done'), [(v) => v.trim().length >= 3, 'At least 3 characters']],
      nextMaintenanceDate: [[isFutureDay, 'Next maintenance must be in the future']],
    });
    setDoneErrors(found);
    if (Object.keys(found).length === 0) setConfirmDone(true);
  };

  const submitComplete = async () => {
    setSavingDone(true);
    try {
      const res = await completeMaintenance(completing.maintenanceId, {
        cost: Number(done.cost),
        completionNotes: done.completionNotes.trim(),
        condition: done.condition,
        makeAvailable: done.makeAvailable,
        ...(done.nextMaintenanceDate && { nextMaintenanceDate: done.nextMaintenanceDate }),
      });
      toast.success(res.message || 'Maintenance completed', { duration: 5000 });
      setConfirmDone(false);
      setCompleting(null);
      reload();
      vehiclesReq.reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setConfirmDone(false);
    } finally {
      setSavingDone(false);
    }
  };

  const columns = [
    {
      key: 'vehicle',
      header: 'Vehicle',
      render: (m) => (
        <div>
          <span className="rounded-md bg-ds-surface px-2 py-1 font-mono text-xs font-semibold">{m.vehicle?.registrationNumber || '—'}</span>
          <p className="mt-1 text-xs text-ds-muted">{m.vehicle?.vehicleName}</p>
        </div>
      ),
    },
    { key: 'maintenanceType', header: 'Type', render: (m) => <span className="font-medium">{m.maintenanceType}</span> },
    { key: 'description', header: 'Description', className: 'max-w-[260px]', render: (m) => <p className="truncate text-ds-muted" title={m.description}>{m.description}</p> },
    { key: 'startDate', header: 'Date', render: (m) => <span className="text-ds-muted whitespace-nowrap">{formatDate(m.startDate)}</span> },
    { key: 'cost', header: 'Cost', align: 'right', render: (m) => <span className="font-semibold tabular-nums">{formatMoney(m.cost)}</span> },
    { key: 'condition', header: 'Vehicle condition', render: (m) => (m.vehicle?.condition ? <StatusBadge status={m.vehicle.condition} /> : '—') },
    { key: 'status', header: 'Status', render: (m) => <StatusBadge status={m.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (m) => (
        <div className="flex justify-end gap-1">
          <Button size="icon" variant="ghost" aria-label="View details" onClick={() => setViewing(m)}>
            <Eye className="h-4 w-4" />
          </Button>
          {m.status === 'In Progress' && (
            <Button size="sm" variant="success" icon={CheckCircle2} onClick={() => openComplete(m)}>
              Complete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={['Fleet Operations', 'Maintenance']}
        title="Maintenance Management"
        subtitle="Record services and repairs, then return vehicles to the fleet."
        actions={
          <Button icon={Plus} onClick={openAdd}>
            Add maintenance record
          </Button>
        }
      />

      <Card bodyClassName="p-0">
        <SearchFilterBar
          showClear={!!(status || type || vehicleFilter)}
          onClear={() => {
            setStatus('');
            setType('');
            setVehicleFilter('');
            setPage(1);
          }}
        >
          <FilterSelect value={vehicleFilter} onChange={reset(setVehicleFilter)} options={vehicleOptions} placeholder="All vehicles" label="Vehicle" />
          <FilterSelect value={status} onChange={reset(setStatus)} options={MAINTENANCE_STATUSES} placeholder="All statuses" />
          <FilterSelect value={type} onChange={reset(setType)} options={MAINTENANCE_TYPES} placeholder="All types" />
          {data && (
            <span className="inline-flex h-10 items-center gap-2 rounded-xl bg-violet-50 px-3 text-sm font-semibold text-violet-700">
              <Coins className="h-4 w-4" /> Total cost: {formatMoney(data.totalCost)}
            </span>
          )}
        </SearchFilterBar>

        <DataTable
          columns={columns}
          rows={data?.data}
          rowKey="maintenanceId"
          loading={loading}
          error={error}
          onRetry={reload}
          emptyTitle="No maintenance records"
          emptyMessage="Add a record when a vehicle is serviced or repaired."
        />
        {!loading && !error && <Pagination pagination={data?.pagination} onPageChange={setPage} />}
      </Card>

      {/* ---------- Add record ---------- */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        closeDisabled={savingRecord}
        size="lg"
        title="Add maintenance record"
        subtitle="'In Progress' moves the vehicle to Under Maintenance"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)} disabled={savingRecord}>
              Cancel
            </Button>
            <Button type="submit" form="maintenance-form" icon={Wrench} loading={savingRecord}>
              Save record
            </Button>
          </>
        }
      >
        <form id="maintenance-form" onSubmit={saveRecord} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select className="sm:col-span-2" label="Vehicle (registration number)" name="vehicleId" required placeholder={vehiclesReq.loading ? 'Loading vehicles…' : 'Select a vehicle'} options={vehicleOptions} value={record.vehicleId} onChange={setR('vehicleId')} error={recordErrors.vehicleId} />
          {selectedVehicle && (
            <div className="sm:col-span-2 flex flex-wrap items-center gap-2 rounded-xl bg-ds-surface px-4 py-3 text-sm">
              <span className="text-ds-muted">Current:</span> <StatusBadge status={selectedVehicle.currentStatus} /> <StatusBadge status={selectedVehicle.condition} />
              <span className="text-ds-muted">· {(selectedVehicle.mileage ?? 0).toLocaleString()} km</span>
            </div>
          )}
          <Select label="Maintenance type" name="maintenanceType" required options={MAINTENANCE_TYPES} value={record.maintenanceType} onChange={setR('maintenanceType')} />
          <Select label="Maintenance status" name="status" options={[{ value: 'In Progress', label: 'In Progress (start job now)' }, { value: 'Completed', label: 'Completed (past job)' }]} value={record.status} onChange={setR('status')} />
          <Textarea className="sm:col-span-2" label="Description" name="description" required maxLength={1000} value={record.description} onChange={setR('description')} error={recordErrors.description} placeholder="e.g. 20,000 km service: oil, filters and brake pads" />
          <Input label="Maintenance date" name="startDate" type="date" required max={todayInput()} value={record.startDate} onChange={setR('startDate')} error={recordErrors.startDate} />
          <Input label="Cost" name="cost" type="number" min="0" step="0.01" prefix={CURRENCY} value={record.cost} onChange={setR('cost')} error={recordErrors.cost} hint="Can be updated when the job is completed" />
          <Input label="Service provider" name="serviceProvider" maxLength={150} value={record.serviceProvider} onChange={setR('serviceProvider')} placeholder="AutoCare Colombo" />
          {record.status === 'Completed' && <Input label="Completion date" name="completedDate" type="date" max={todayInput()} value={record.completedDate} onChange={setR('completedDate')} error={recordErrors.completedDate} />}
        </form>
      </Modal>

      {/* ---------- Complete job ---------- */}
      <Modal
        open={!!completing && !confirmDone}
        onClose={() => setCompleting(null)}
        title="Complete maintenance"
        subtitle={completing && `${completing.maintenanceId} · ${completing.vehicle?.registrationNumber || ''}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCompleting(null)}>
              Cancel
            </Button>
            <Button variant="success" icon={CheckCircle2} onClick={reviewComplete}>
              Review & complete
            </Button>
          </>
        }
      >
        {completing && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <p className="sm:col-span-2 rounded-xl bg-ds-surface p-3 text-sm text-ds-ink">
              <span className="font-semibold">{completing.maintenanceType}:</span> {completing.description}
            </p>
            <Input label="Final cost" name="cost" type="number" min="0" step="0.01" prefix={CURRENCY} required value={done.cost} onChange={(e) => setDone((d) => ({ ...d, cost: e.target.value }))} error={doneErrors.cost} />
            <Select label="Vehicle condition after service" name="condition" options={VEHICLE_CONDITIONS} value={done.condition} onChange={(e) => setDone((d) => ({ ...d, condition: e.target.value }))} />
            <Textarea className="sm:col-span-2" label="Work completed" name="completionNotes" required rows={2} maxLength={1000} value={done.completionNotes} onChange={(e) => setDone((d) => ({ ...d, completionNotes: e.target.value }))} error={doneErrors.completionNotes} placeholder="e.g. Bumper replaced and repainted" />
            <Input label="Next maintenance date" name="nextMaintenanceDate" type="date" min={todayInput()} value={done.nextMaintenanceDate} onChange={(e) => setDone((d) => ({ ...d, nextMaintenanceDate: e.target.value }))} error={doneErrors.nextMaintenanceDate} hint="Default: 90 days from today" />
            <div className="sm:col-span-2">
              <Checkbox
                label="Change vehicle status to Available"
                description="Only happens if no other job is open and the condition is not Damaged"
                checked={done.makeAvailable}
                onChange={(v) => setDone((d) => ({ ...d, makeAvailable: v }))}
              />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmDone}
        onClose={() => setConfirmDone(false)}
        onConfirm={submitComplete}
        loading={savingDone}
        tone="success"
        title="Mark maintenance as completed?"
        confirmLabel="Complete job"
        message={
          <>
            Close job <span className="font-mono text-xs">{completing?.maintenanceId}</span> with a final cost of <strong className="text-ds-ink">{formatMoney(Number(done.cost))}</strong>.
            {done.makeAvailable ? ' The vehicle will be made Available if no other work is pending.' : ' The vehicle will stay out of service.'}
          </>
        }
      />

      {/* ---------- Details ---------- */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Maintenance record" subtitle={viewing?.maintenanceId}>
        {viewing && (
          <dl className="divide-y divide-slate-100">
            <DetailRow label="Vehicle">{viewing.vehicle ? `${viewing.vehicle.registrationNumber} · ${viewing.vehicle.vehicleName}` : viewing.vehicleId}</DetailRow>
            <DetailRow label="Status"><StatusBadge status={viewing.status} /></DetailRow>
            <DetailRow label="Type">{viewing.maintenanceType}</DetailRow>
            <DetailRow label="Description">{viewing.description}</DetailRow>
            <DetailRow label="Started">{formatDate(viewing.startDate)}</DetailRow>
            <DetailRow label="Completed">{formatDate(viewing.completedDate)}</DetailRow>
            <DetailRow label="Cost">{formatMoney(viewing.cost)}</DetailRow>
            <DetailRow label="Service provider">{viewing.serviceProvider}</DetailRow>
            <DetailRow label="Mileage at service">{viewing.mileageAtService != null ? `${viewing.mileageAtService.toLocaleString()} km` : null}</DetailRow>
            {viewing.relatedBookingId && <DetailRow label="From rental return" mono>{viewing.relatedBookingId}</DetailRow>}
            {viewing.completionNotes && <DetailRow label="Work completed">{viewing.completionNotes}</DetailRow>}
          </dl>
        )}
      </Modal>
    </>
  );
}
