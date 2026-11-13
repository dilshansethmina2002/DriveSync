// =============================================================
//  Fleet business logic: vehicles, status changes and rental returns
// =============================================================
import mongoose from 'mongoose';
import Vehicle from '../models/Vehicle.js';
import Maintenance from '../models/Maintenance.js';
import AppError from '../utils/AppError.js';
import { canTransition, STATUS_TRANSITIONS } from '../utils/statusTransitions.js';
import { generateMaintenanceId } from '../utils/generateId.js';
import { getPagination, buildPaginationMeta } from '../utils/pagination.js';

// Escape characters that have a special meaning inside a regular expression,
// so a search like "C++" or ".*" cannot break / abuse the query.
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// -------------------------------------------------------------
// Shared helpers (also used by maintenanceService.js)
// -------------------------------------------------------------
export const findVehicleOrFail = async (vehicleId) => {
  const vehicle = await Vehicle.findOne({ vehicleId });
  if (!vehicle) throw new AppError(`Vehicle ${vehicleId} is not registered in the fleet`, 404);
  return vehicle;
};

export const countOpenMaintenance = (vehicleId) => Maintenance.countDocuments({ vehicleId, status: 'In Progress' });

/**
 * THE single place where a vehicle's status changes.
 * Every endpoint goes through here, so the rules are always enforced:
 *   1. the transition must be allowed by the state machine
 *   2. a vehicle cannot become Available while maintenance is still open
 * Does NOT save - the caller saves (so it can change other fields too).
 */
export const applyStatusChange = async (vehicle, newStatus, reason, user) => {
  const from = vehicle.currentStatus;

  if (from === newStatus) {
    throw new AppError(`Vehicle is already ${newStatus}`, 409);
  }
  if (!canTransition(from, newStatus)) {
    throw new AppError(
      `Invalid status change: ${from} -> ${newStatus}. Allowed from ${from}: ${STATUS_TRANSITIONS[from].join(', ')}`,
      409
    );
  }
  if (newStatus === 'Available' && (await countOpenMaintenance(vehicle.vehicleId)) > 0) {
    throw new AppError('Vehicle still has maintenance In Progress. Complete the maintenance first.', 409);
  }
  if (newStatus === 'Available' && vehicle.condition === 'Damaged') {
    throw new AppError('A Damaged vehicle cannot be made Available. Record and complete a repair first.', 409);
  }

  vehicle.currentStatus = newStatus;
  vehicle.statusHistory.push({ from, to: newStatus, reason: reason || 'No reason given', changedBy: String(user?.id || 'system') });
  return vehicle;
};

/** Creates an "In Progress" maintenance record and links it to the vehicle (does not save the vehicle) */
export const openMaintenanceRecord = async (vehicle, data, user) => {
  const record = await Maintenance.create({
    maintenanceId: generateMaintenanceId(),
    vehicle: vehicle._id,
    vehicleId: vehicle.vehicleId,
    maintenanceType: data.maintenanceType,
    description: data.description,
    status: data.status || 'In Progress',
    cost: data.cost ?? 0,
    serviceProvider: data.serviceProvider,
    mileageAtService: data.mileageAtService ?? vehicle.mileage,
    startDate: data.startDate || new Date(),
    completedDate: data.completedDate || null,
    relatedBookingId: data.relatedBookingId || null,
    completionNotes: data.completionNotes,
    performedBy: String(user?.id || 'system'),
  });
  vehicle.maintenanceHistory.push(record._id);
  return record;
};

// -------------------------------------------------------------
// 1. Register a vehicle in the fleet
// -------------------------------------------------------------
export const registerVehicle = async (data, user) => {
  // Friendly duplicate check (the unique index is the final safety net)
  const existing = await Vehicle.findOne({
    $or: [{ vehicleId: data.vehicleId }, { registrationNumber: data.registrationNumber.toUpperCase() }],
  });
  if (existing) {
    throw new AppError('A vehicle with this vehicleId or registrationNumber is already registered', 409);
  }

  const status = data.currentStatus || 'Available';
  return Vehicle.create({
    ...data,
    currentStatus: status,
    statusHistory: [{ from: null, to: status, reason: 'Registered in fleet', changedBy: String(user.id) }],
  });
};

// -------------------------------------------------------------
// 2. List / read vehicles
// -------------------------------------------------------------
export const listVehicles = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.status) filter.currentStatus = String(query.status);
  if (query.condition) filter.condition = String(query.condition);
  if (query.search) {
    const regex = new RegExp(escapeRegex(String(query.search)), 'i');
    filter.$or = [{ vehicleName: regex }, { registrationNumber: regex }];
  }
  // ?dueForMaintenance=true -> next service date is today or already passed
  if (query.dueForMaintenance === 'true') {
    // mongoose.trusted(): we wrote these operators ourselves, so tell
    // sanitizeFilter (see config/db.js) not to neutralise them.
    filter.nextMaintenanceDate = mongoose.trusted({ $ne: null, $lte: new Date() });
  }

  const [vehicles, total] = await Promise.all([
    Vehicle.find(filter).select('-statusHistory').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Vehicle.countDocuments(filter),
  ]);

  return { vehicles, pagination: buildPaginationMeta(page, limit, total) };
};

export const getVehicle = async (vehicleId) => {
  const vehicle = await Vehicle.findOne({ vehicleId }).populate({
    path: 'maintenanceHistory',
    options: { sort: { startDate: -1 }, limit: 5 }, // last 5 records; full list has its own endpoint
  });
  if (!vehicle) throw new AppError(`Vehicle ${vehicleId} is not registered in the fleet`, 404);
  return vehicle;
};

/** Small, safe response other services can use before creating a booking */
export const getAvailability = async (vehicleId) => {
  const vehicle = await findVehicleOrFail(vehicleId);
  return {
    vehicleId: vehicle.vehicleId,
    currentStatus: vehicle.currentStatus,
    condition: vehicle.condition,
    isAvailableForRent: vehicle.currentStatus === 'Available',
  };
};

// -------------------------------------------------------------
// 3. Update details (name, registration, next maintenance date...)
// -------------------------------------------------------------
export const updateVehicleDetails = async (vehicleId, data) => {
  const vehicle = await findVehicleOrFail(vehicleId);

  if (data.registrationNumber) {
    const taken = await Vehicle.findOne({
      registrationNumber: data.registrationNumber.toUpperCase(),
      vehicleId: mongoose.trusted({ $ne: vehicleId }), // "any OTHER vehicle"
    });
    if (taken) throw new AppError('This registrationNumber is already used by another vehicle', 409);
  }
  if (data.mileage !== undefined && data.mileage < vehicle.mileage) {
    throw new AppError(`Mileage cannot go down (current: ${vehicle.mileage} km)`, 400);
  }

  // Only these fields can be edited here. Status has its own endpoint with rules.
  const editable = ['vehicleName', 'registrationNumber', 'condition', 'mileage', 'nextMaintenanceDate'];
  editable.forEach((field) => {
    if (data[field] !== undefined) vehicle[field] = data[field];
  });

  await vehicle.save();
  return vehicle;
};

// -------------------------------------------------------------
// 4. Status changes
// -------------------------------------------------------------
export const changeStatus = async (vehicleId, newStatus, reason, user) => {
  const vehicle = await findVehicleOrFail(vehicleId);
  await applyStatusChange(vehicle, newStatus, reason, user);
  await vehicle.save();
  return vehicle;
};

// -------------------------------------------------------------
// 5. Rental return (called by staff or by the Booking Service)
// -------------------------------------------------------------
// Conditions that mean "do not rent this car again until it is checked"
const NEEDS_ATTENTION = ['Poor', 'Damaged'];

export const processReturn = async (vehicleId, data, user) => {
  const vehicle = await findVehicleOrFail(vehicleId);

  if (vehicle.currentStatus !== 'Rented') {
    throw new AppError(`Only Rented vehicles can be returned (current status: ${vehicle.currentStatus})`, 409);
  }
  if (data.mileage !== undefined && data.mileage < vehicle.mileage) {
    throw new AppError(`Return mileage (${data.mileage}) cannot be lower than current mileage (${vehicle.mileage})`, 400);
  }

  // Update condition / mileage with what staff observed at return
  vehicle.condition = data.condition;
  if (data.mileage !== undefined) vehicle.mileage = data.mileage;
  vehicle.lastReturn = {
    bookingId: data.bookingId,
    returnedAt: new Date(),
    conditionOnReturn: data.condition,
    mileageOnReturn: vehicle.mileage,
    notes: data.damageNotes || data.notes,
  };

  // Decide the next status
  const needsMaintenance = data.needsMaintenance === true || NEEDS_ATTENTION.includes(data.condition);
  let maintenanceRecord = null;

  if (needsMaintenance) {
    await applyStatusChange(vehicle, 'Under Maintenance', `Returned in ${data.condition} condition (booking ${data.bookingId})`, user);
    // Automatically open a maintenance job so the problem is tracked
    maintenanceRecord = await openMaintenanceRecord(
      vehicle,
      {
        maintenanceType: data.condition === 'Damaged' ? 'Repair' : 'Inspection',
        description: data.damageNotes || `Post-rental check: vehicle returned in ${data.condition} condition`,
        relatedBookingId: data.bookingId,
      },
      user
    );
  } else {
    await applyStatusChange(vehicle, 'Available', `Returned in ${data.condition} condition (booking ${data.bookingId})`, user);
  }

  await vehicle.save();
  return { vehicle, maintenanceRecord };
};
