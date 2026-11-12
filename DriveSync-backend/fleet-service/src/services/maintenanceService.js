// =============================================================
//  Maintenance business logic
// =============================================================
import Maintenance from '../models/Maintenance.js';
import AppError from '../utils/AppError.js';
import config from '../config/env.js';
import { getPagination, buildPaginationMeta } from '../utils/pagination.js';
import { findVehicleOrFail, applyStatusChange, openMaintenanceRecord, countOpenMaintenance } from './fleetService.js';

const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

// -------------------------------------------------------------
// 1. Record maintenance
//    status "In Progress" (default) -> vehicle becomes Under Maintenance
//    status "Completed"             -> a past job, just saved to history
// -------------------------------------------------------------
export const recordMaintenance = async (vehicleId, data, user) => {
  const vehicle = await findVehicleOrFail(vehicleId);
  const status = data.status || 'In Progress';

  if (status === 'In Progress') {
    if (vehicle.currentStatus === 'Rented') {
      throw new AppError('Vehicle is currently Rented. Process the rental return before starting maintenance.', 409);
    }
    // Move the vehicle to Under Maintenance (if it is not already)
    if (vehicle.currentStatus !== 'Under Maintenance') {
      await applyStatusChange(vehicle, 'Under Maintenance', `Maintenance started: ${data.maintenanceType}`, user);
    }
  }

  if (status === 'Completed') {
    const completedDate = data.completedDate ? new Date(data.completedDate) : new Date();
    data.completedDate = completedDate;
    // Keep lastMaintenanceDate as the most recent date
    if (!vehicle.lastMaintenanceDate || completedDate > vehicle.lastMaintenanceDate) {
      vehicle.lastMaintenanceDate = completedDate;
    }
  }

  const record = await openMaintenanceRecord(vehicle, { ...data, status }, user);
  await vehicle.save();
  return { record, vehicle };
};

// -------------------------------------------------------------
// 2. Complete maintenance -> vehicle back to Available
// -------------------------------------------------------------
export const completeMaintenance = async (maintenanceId, data, user) => {
  const record = await Maintenance.findOne({ maintenanceId });
  if (!record) throw new AppError(`Maintenance record ${maintenanceId} not found`, 404);
  if (record.status === 'Completed') throw new AppError('This maintenance is already completed', 409);

  const vehicle = await findVehicleOrFail(record.vehicleId);
  const completedDate = new Date();

  // Close the maintenance job
  record.status = 'Completed';
  record.completedDate = completedDate;
  if (data.cost !== undefined) record.cost = data.cost;
  if (data.completionNotes) record.completionNotes = data.completionNotes;
  await record.save();

  // Update the vehicle's maintenance dates and condition
  vehicle.lastMaintenanceDate = completedDate;
  vehicle.nextMaintenanceDate = data.nextMaintenanceDate
    ? new Date(data.nextMaintenanceDate)
    : addDays(completedDate, config.maintenanceIntervalDays);
  if (data.condition) vehicle.condition = data.condition;

  // Make the vehicle Available again, but only if:
  //   - the caller did not say makeAvailable: false
  //   - it is currently Under Maintenance
  //   - no OTHER maintenance job is still open
  const makeAvailable = data.makeAvailable !== false;
  const stillOpen = await countOpenMaintenance(vehicle.vehicleId);
  let message = 'Maintenance completed.';

  if (makeAvailable && vehicle.currentStatus === 'Under Maintenance') {
    if (stillOpen > 0) {
      message += ` Vehicle stays Under Maintenance: ${stillOpen} other job(s) still In Progress.`;
    } else if (vehicle.condition === 'Damaged') {
      message += ' Vehicle stays Under Maintenance because its condition is still Damaged.';
    } else {
      await applyStatusChange(vehicle, 'Available', `Maintenance ${record.maintenanceId} completed`, user);
      message += ' Vehicle is now Available.';
    }
  }

  await vehicle.save();
  return { record, vehicle, message };
};

// -------------------------------------------------------------
// 3. Read maintenance history
// -------------------------------------------------------------
const listMaintenance = async (filter, query) => {
  const { page, limit, skip } = getPagination(query);
  if (query.status) filter.status = String(query.status);
  if (query.type) filter.maintenanceType = String(query.type);

  const [records, total] = await Promise.all([
    Maintenance.find(filter).sort({ startDate: -1 }).skip(skip).limit(limit),
    Maintenance.countDocuments(filter),
  ]);

  // Total money spent on the records that match (useful for reports)
  const [costSummary] = await Maintenance.aggregate([{ $match: filter }, { $group: { _id: null, totalCost: { $sum: '$cost' } } }]);

  return { records, pagination: buildPaginationMeta(page, limit, total), totalCost: costSummary?.totalCost || 0 };
};

export const getVehicleMaintenanceHistory = async (vehicleId, query) => {
  await findVehicleOrFail(vehicleId); // 404 if the vehicle does not exist
  return listMaintenance({ vehicleId }, query);
};

export const getAllMaintenance = (query) => listMaintenance({}, query);

export const getMaintenanceById = async (maintenanceId) => {
  const record = await Maintenance.findOne({ maintenanceId });
  if (!record) throw new AppError(`Maintenance record ${maintenanceId} not found`, 404);
  return record;
};
