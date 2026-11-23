// =============================================================
//  MOCK Fleet Management Service - same rules as the real backend
//  (only used when VITE_USE_MOCK=true)
// =============================================================
import { mockVehicles, mockMaintenance } from './mockData';
import { delay, mockError, paginate, upperHex, datePart, clone } from './mockUtils';
import { STATUS_TRANSITIONS } from '../../config/appConfig';
import { getUser } from '../../utils/auth';

const vehicles = clone(mockVehicles);
const maintenance = clone(mockMaintenance);

const ok = (data, extra = {}) => ({ success: true, data: clone(data), ...extra });
const findVehicle = (vehicleId) => vehicles.find((v) => v.vehicleId === vehicleId) || mockError(404, `Vehicle ${vehicleId} is not registered in the fleet`);
const withVehicle = (m) => {
  const v = vehicles.find((x) => x.vehicleId === m.vehicleId);
  return { ...m, vehicle: v ? { vehicleName: v.vehicleName, registrationNumber: v.registrationNumber, currentStatus: v.currentStatus, condition: v.condition } : null };
};
const openJobs = (vehicleId) => maintenance.filter((m) => m.vehicleId === vehicleId && m.status === 'In Progress').length;

const applyStatusChange = (v, to, reason) => {
  const from = v.currentStatus;
  if (from === to) mockError(409, `Vehicle is already ${to}`);
  if (!STATUS_TRANSITIONS[from].includes(to)) mockError(409, `Invalid status change: ${from} -> ${to}. Allowed from ${from}: ${STATUS_TRANSITIONS[from].join(', ')}`);
  if (to === 'Available' && openJobs(v.vehicleId) > 0) mockError(409, 'Vehicle still has maintenance In Progress. Complete the maintenance first.');
  if (to === 'Available' && v.condition === 'Damaged') mockError(409, 'A Damaged vehicle cannot be made Available. Record and complete a repair first.');
  v.currentStatus = to;
  v.statusHistory.push({ from, to, reason: reason || 'No reason given', changedBy: getUser()?.id || 'admin', changedAt: new Date().toISOString() });
  v.updatedAt = new Date().toISOString();
};

const openJob = (v, data) => {
  const now = new Date().toISOString();
  const job = {
    _id: `mockmnt${maintenance.length + 1}`,
    maintenanceId: `MNT-${datePart()}-${upperHex()}`,
    vehicleId: v.vehicleId,
    maintenanceType: data.maintenanceType,
    description: data.description,
    status: data.status || 'In Progress',
    cost: Number(data.cost) || 0,
    serviceProvider: data.serviceProvider,
    mileageAtService: data.mileageAtService ?? v.mileage,
    startDate: data.startDate || now,
    completedDate: data.completedDate || null,
    relatedBookingId: data.relatedBookingId || null,
    completionNotes: data.completionNotes,
    performedBy: getUser()?.id,
    createdAt: now,
    updatedAt: now,
  };
  maintenance.unshift(job);
  return job;
};

export const getFleetStats = async () => {
  await delay();
  const count = (status) => vehicles.filter((v) => v.currentStatus === status).length;
  return ok({
    totalVehicles: vehicles.length,
    available: count('Available'),
    rented: count('Rented'),
    underMaintenance: count('Under Maintenance'),
    inactive: count('Inactive'),
    statusBreakdown: ['Available', 'Rented', 'Under Maintenance', 'Inactive'].map((status) => ({ status, count: count(status) })),
    conditionBreakdown: ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'].map((condition) => ({ condition, count: vehicles.filter((v) => v.condition === condition).length })),
    dueForMaintenance: vehicles.filter((v) => v.nextMaintenanceDate && new Date(v.nextMaintenanceDate) <= new Date()).length,
    openMaintenance: maintenance.filter((m) => m.status === 'In Progress').length,
    totalMaintenanceCost: maintenance.reduce((t, m) => t + m.cost, 0),
    recentMaintenance: [...maintenance].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 6).map(withVehicle),
  });
};

export const listVehicles = async (params = {}) => {
  await delay();
  let rows = vehicles;
  if (params.status) rows = rows.filter((v) => v.currentStatus === params.status);
  if (params.condition) rows = rows.filter((v) => v.condition === params.condition);
  if (params.search) {
    const s = params.search.toLowerCase();
    rows = rows.filter((v) => v.vehicleName.toLowerCase().includes(s) || v.registrationNumber.toLowerCase().includes(s));
  }
  if (params.dueForMaintenance === 'true') rows = rows.filter((v) => v.nextMaintenanceDate && new Date(v.nextMaintenanceDate) <= new Date());
  rows = [...rows].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const { data, pagination } = paginate(rows, params);
  return ok(data, { count: data.length, pagination });
};

export const getVehicle = async (vehicleId) => {
  await delay();
  const v = findVehicle(vehicleId);
  const recent = maintenance.filter((m) => m.vehicleId === vehicleId).slice(0, 5);
  return ok({ ...v, maintenanceHistory: recent });
};

export const registerVehicle = async (payload) => {
  await delay(500);
  const reg = payload.registrationNumber.toUpperCase();
  if (vehicles.some((v) => v.vehicleId === payload.vehicleId || v.registrationNumber === reg)) {
    mockError(409, 'A vehicle with this vehicleId or registrationNumber is already registered');
  }
  const now = new Date().toISOString();
  const status = payload.currentStatus || 'Available';
  const v = {
    _id: `mockvehicle${vehicles.length + 1}`,
    condition: 'Good',
    mileage: 0,
    lastMaintenanceDate: null,
    nextMaintenanceDate: null,
    maintenanceHistory: [],
    lastReturn: null,
    ...payload,
    registrationNumber: reg,
    currentStatus: status,
    statusHistory: [{ from: null, to: status, reason: 'Registered in fleet', changedBy: getUser()?.id, changedAt: now }],
    createdAt: now,
    updatedAt: now,
  };
  vehicles.unshift(v);
  return ok(v, { message: 'Vehicle registered in fleet' });
};

export const updateVehicle = async (vehicleId, payload) => {
  await delay(400);
  const v = findVehicle(vehicleId);
  if (payload.registrationNumber && vehicles.some((x) => x.vehicleId !== vehicleId && x.registrationNumber === payload.registrationNumber.toUpperCase())) {
    mockError(409, 'This registrationNumber is already used by another vehicle');
  }
  if (payload.mileage !== undefined && payload.mileage < v.mileage) mockError(400, `Mileage cannot go down (current: ${v.mileage} km)`);
  Object.assign(v, payload, payload.registrationNumber ? { registrationNumber: payload.registrationNumber.toUpperCase() } : {});
  return ok(v, { message: 'Vehicle details updated' });
};

export const changeVehicleStatus = async (vehicleId, status, reason) => {
  await delay(400);
  const v = findVehicle(vehicleId);
  applyStatusChange(v, status, reason);
  return ok(v, { message: `Vehicle status changed to ${status}` });
};

export const returnVehicle = async (vehicleId, data) => {
  await delay(600);
  const v = findVehicle(vehicleId);
  if (v.currentStatus !== 'Rented') mockError(409, `Only Rented vehicles can be returned (current status: ${v.currentStatus})`);
  if (data.mileage !== undefined && data.mileage < v.mileage) mockError(400, `Return mileage (${data.mileage}) cannot be lower than current mileage (${v.mileage})`);
  v.condition = data.condition;
  if (data.mileage !== undefined) v.mileage = data.mileage;
  v.lastReturn = { bookingId: data.bookingId, returnedAt: data.returnDate || new Date().toISOString(), conditionOnReturn: data.condition, mileageOnReturn: v.mileage, notes: data.damageNotes || data.notes };
  const needs = data.needsMaintenance === true || ['Poor', 'Damaged'].includes(data.condition);
  let job = null;
  if (needs) {
    applyStatusChange(v, 'Under Maintenance', `Returned in ${data.condition} condition (booking ${data.bookingId})`);
    job = openJob(v, {
      maintenanceType: data.condition === 'Damaged' ? 'Repair' : 'Inspection',
      description: data.damageNotes || `Post-rental check: vehicle returned in ${data.condition} condition`,
      relatedBookingId: data.bookingId,
    });
  } else {
    applyStatusChange(v, 'Available', `Returned in ${data.condition} condition (booking ${data.bookingId})`);
  }
  return ok(
    { vehicle: v, maintenanceRecord: job },
    { message: job ? `Return processed. Vehicle needs attention and is now Under Maintenance (${job.maintenanceId}).` : 'Return processed. Vehicle is Available for the next rental.' }
  );
};

export const recordMaintenance = async (vehicleId, data) => {
  await delay(500);
  const v = findVehicle(vehicleId);
  const status = data.status || 'In Progress';
  if (status === 'In Progress') {
    if (v.currentStatus === 'Rented') mockError(409, 'Vehicle is currently Rented. Process the rental return before starting maintenance.');
    if (v.currentStatus !== 'Under Maintenance') applyStatusChange(v, 'Under Maintenance', `Maintenance started: ${data.maintenanceType}`);
  } else {
    const done = data.completedDate || new Date().toISOString();
    data.completedDate = done;
    if (!v.lastMaintenanceDate || new Date(done) > new Date(v.lastMaintenanceDate)) v.lastMaintenanceDate = done;
  }
  const job = openJob(v, { ...data, status });
  return ok({ maintenance: job, vehicleStatus: v.currentStatus }, { message: status === 'In Progress' ? 'Maintenance started. Vehicle is Under Maintenance.' : 'Completed maintenance recorded in history.' });
};

export const listMaintenance = async (params = {}) => {
  await delay();
  let rows = maintenance;
  if (params.vehicleId) {
    findVehicle(params.vehicleId);
    rows = rows.filter((m) => m.vehicleId === params.vehicleId);
  }
  if (params.status) rows = rows.filter((m) => m.status === params.status);
  if (params.type) rows = rows.filter((m) => m.maintenanceType === params.type);
  rows = [...rows].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  const totalCost = rows.reduce((t, m) => t + m.cost, 0);
  const { data, pagination } = paginate(rows, params);
  return ok(data.map(withVehicle), { count: data.length, totalCost, pagination });
};

export const completeMaintenance = async (maintenanceId, data) => {
  await delay(600);
  const job = maintenance.find((m) => m.maintenanceId === maintenanceId) || mockError(404, `Maintenance record ${maintenanceId} not found`);
  if (job.status === 'Completed') mockError(409, 'This maintenance is already completed');
  const v = findVehicle(job.vehicleId);
  const now = new Date();
  job.status = 'Completed';
  job.completedDate = now.toISOString();
  job.updatedAt = now.toISOString();
  if (data.cost !== undefined) job.cost = Number(data.cost);
  if (data.completionNotes) job.completionNotes = data.completionNotes;
  v.lastMaintenanceDate = now.toISOString();
  v.nextMaintenanceDate = data.nextMaintenanceDate || new Date(now.getTime() + 90 * 864e5).toISOString();
  if (data.condition) v.condition = data.condition;
  let message = 'Maintenance completed.';
  if (data.makeAvailable !== false && v.currentStatus === 'Under Maintenance') {
    if (openJobs(v.vehicleId) > 0) message += ' Vehicle stays Under Maintenance: other job(s) still In Progress.';
    else if (v.condition === 'Damaged') message += ' Vehicle stays Under Maintenance because its condition is still Damaged.';
    else {
      applyStatusChange(v, 'Available', `Maintenance ${maintenanceId} completed`);
      message += ' Vehicle is now Available.';
    }
  }
  return ok({ maintenance: withVehicle(job), vehicle: v }, { message });
};
