// =============================================================
//  Maintenance controller - logic is in maintenanceService
// =============================================================
import { matchedData } from 'express-validator';
import * as maintenanceService from '../services/maintenanceService.js';

// POST /api/fleet/vehicles/:vehicleId/maintenance
export const recordMaintenance = async (req, res) => {
  const data = matchedData(req, { locations: ['body'] });
  const { record, vehicle } = await maintenanceService.recordMaintenance(req.params.vehicleId, data, req.user);
  res.status(201).json({
    success: true,
    message:
      record.status === 'In Progress'
        ? 'Maintenance started. Vehicle is Under Maintenance.'
        : 'Completed maintenance recorded in history.',
    data: { maintenance: record, vehicleStatus: vehicle.currentStatus },
  });
};

// GET /api/fleet/vehicles/:vehicleId/maintenance
export const getVehicleHistory = async (req, res) => {
  const { records, pagination, totalCost } = await maintenanceService.getVehicleMaintenanceHistory(req.params.vehicleId, req.query);
  res.status(200).json({ success: true, count: records.length, totalCost, pagination, data: records });
};

// GET /api/fleet/maintenance
export const getAllMaintenance = async (req, res) => {
  const { records, pagination, totalCost } = await maintenanceService.getAllMaintenance(req.query);
  res.status(200).json({ success: true, count: records.length, totalCost, pagination, data: records });
};

// GET /api/fleet/maintenance/:maintenanceId
export const getMaintenance = async (req, res) => {
  const record = await maintenanceService.getMaintenanceById(req.params.maintenanceId);
  res.status(200).json({ success: true, data: record });
};

// PATCH /api/fleet/maintenance/:maintenanceId/complete
export const completeMaintenance = async (req, res) => {
  const data = matchedData(req, { locations: ['body'] });
  const { record, vehicle, message } = await maintenanceService.completeMaintenance(req.params.maintenanceId, data, req.user);
  res.status(200).json({ success: true, message, data: { maintenance: record, vehicle } });
};
