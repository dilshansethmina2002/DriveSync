// =============================================================
//  Vehicle Management (Admin)
//  List / search / filter:  GET /api/fleet/vehicles?search&status&condition&dueForMaintenance&page
//  Add, view, edit and status change are handled by the modals in components/fleet/
// =============================================================
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Eye, Pencil, ArrowLeftRight, CalendarClock } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import SearchFilterBar, { FilterSelect } from '../../components/ui/SearchFilterBar';
import VehicleFormModal from '../../components/fleet/VehicleFormModal';
import VehicleDetailsModal from '../../components/fleet/VehicleDetailsModal';
import StatusChangeModal from '../../components/fleet/StatusChangeModal';
import useAsync from '../../hooks/useAsync';
import useDebounce from '../../hooks/useDebounce';
import { listVehicles } from '../../api/fleetApi';
import { VEHICLE_STATUSES, VEHICLE_CONDITIONS } from '../../config/appConfig';
import { formatDate, shortId } from '../../utils/format';

export default function VehicleManagement() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(params.get('status') || '');
  const [condition, setCondition] = useState('');
  const [dueOnly, setDueOnly] = useState(params.get('due') === '1');
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search.trim());

  const { data, loading, error, reload } = useAsync(
    () => listVehicles({ search: debounced, status, condition, dueForMaintenance: dueOnly ? 'true' : '', page, limit: 10 }),
    [debounced, status, condition, dueOnly, page]
  );

  // Modals. /fleet/vehicles?add=1 (from the dashboard) opens the "Add" form directly
  const [formOpen, setFormOpenState] = useState(() => params.get('add') === '1');
  const [editing, setEditing] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);

  const setFormOpen = (open) => {
    setFormOpenState(open);
    // remove ?add=1 so a page refresh does not reopen the form
    if (!open && params.has('add')) {
      params.delete('add');
      setParams(params, { replace: true });
    }
  };

  const reset = (setter) => (v) => {
    setter(v);
    setPage(1);
  };
  const hasFilters = search || status || condition || dueOnly;
  const isOverdue = (v) => v.nextMaintenanceDate && new Date(v.nextMaintenanceDate) <= new Date();

  const columns = [
    { key: 'vehicleId', header: 'Vehicle ID', render: (v) => <span className="font-mono text-xs text-ds-muted" title={v.vehicleId}>{shortId(v.vehicleId)}</span> },
    { key: 'vehicleName', header: 'Vehicle name', render: (v) => <span className="font-semibold text-ds-ink">{v.vehicleName}</span> },
    { key: 'registrationNumber', header: 'Registration', render: (v) => <span className="rounded-md bg-ds-surface px-2 py-1 font-mono text-xs font-semibold">{v.registrationNumber}</span> },
    { key: 'currentStatus', header: 'Status', render: (v) => <StatusBadge status={v.currentStatus} /> },
    { key: 'condition', header: 'Condition', render: (v) => <StatusBadge status={v.condition} /> },
    { key: 'lastMaintenanceDate', header: 'Last service', render: (v) => <span className="text-ds-muted">{formatDate(v.lastMaintenanceDate)}</span> },
    {
      key: 'nextMaintenanceDate',
      header: 'Next service',
      render: (v) => (
        <span className={`inline-flex items-center gap-1 ${isOverdue(v) ? 'font-semibold text-rose-600' : 'text-ds-muted'}`}>
          {isOverdue(v) && <CalendarClock className="h-3.5 w-3.5" />}
          {formatDate(v.nextMaintenanceDate)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (v) => (
        <div className="flex justify-end gap-1">
          <Button size="icon" variant="ghost" title="View" aria-label={`View ${v.registrationNumber}`} onClick={() => setViewingId(v.vehicleId)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" title="Edit" aria-label={`Edit ${v.registrationNumber}`} onClick={() => setEditing(v)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary" icon={ArrowLeftRight} onClick={() => setStatusTarget(v)}>
            Status
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={['Fleet Operations', 'Vehicles']}
        title="Vehicle Management"
        subtitle="Register vehicles, track their condition and control their operational status."
        actions={
          <Button icon={Plus} onClick={() => setFormOpen(true)}>
            Add vehicle
          </Button>
        }
      />

      <Card bodyClassName="p-0">
        <SearchFilterBar
          search={search}
          onSearchChange={reset(setSearch)}
          searchPlaceholder="Search by name or registration…"
          showClear={!!hasFilters}
          onClear={() => {
            setSearch('');
            setStatus('');
            setCondition('');
            setDueOnly(false);
            setPage(1);
          }}
        >
          <FilterSelect value={status} onChange={reset(setStatus)} options={VEHICLE_STATUSES} placeholder="All statuses" />
          <FilterSelect value={condition} onChange={reset(setCondition)} options={VEHICLE_CONDITIONS} placeholder="All conditions" />
          <button
            onClick={() => reset(setDueOnly)(!dueOnly)}
            className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition ${dueOnly ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-slate-200 bg-white text-ds-ink hover:bg-slate-50'}`}
          >
            <CalendarClock className="h-4 w-4" /> Service due
          </button>
        </SearchFilterBar>

        <DataTable
          columns={columns}
          rows={data?.data}
          rowKey="vehicleId"
          loading={loading}
          error={error}
          onRetry={reload}
          emptyTitle={hasFilters ? 'No matching vehicles' : 'No vehicles in the fleet'}
          emptyMessage={hasFilters ? 'Try a different search or filter.' : 'Register your first vehicle to start tracking it.'}
          emptyAction={!hasFilters && <Button size="sm" icon={Plus} onClick={() => setFormOpen(true)}>Add vehicle</Button>}
        />
        {!loading && !error && <Pagination pagination={data?.pagination} onPageChange={setPage} />}
      </Card>

      {/* key = a new, clean form every time it opens */}
      {(formOpen || editing) && (
        <VehicleFormModal
          key={editing?.vehicleId || 'new'}
          vehicle={editing}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSaved={reload}
        />
      )}
      <VehicleDetailsModal
        vehicleId={viewingId}
        onClose={() => setViewingId(null)}
        onEdit={(v) => {
          setViewingId(null);
          setEditing(v);
        }}
        onChangeStatus={(v) => {
          setViewingId(null);
          setStatusTarget(v);
        }}
      />
      <StatusChangeModal key={statusTarget?.vehicleId || 'none'} vehicle={statusTarget} onClose={() => setStatusTarget(null)} onSaved={reload} />
    </>
  );
}
