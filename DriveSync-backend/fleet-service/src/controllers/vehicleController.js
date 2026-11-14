// =============================================================
//  Vehicle controller - HTTP in, HTTP out. Logic is in fleetService.
// =============================================================
import { matchedData } from 'express-validator';
import * as fleetService from '../services/fleetService.js';

// POST /api/fleet/vehicles
export const registerVehicle = async (req, res) => {
  const data = matchedData(req, { locations: ['body'] });
  const vehicle = await fleetService.registerVehicle(data, req.user);
  res.status(201).json({ success: true, message: 'Vehicle registered in fleet', data: vehicle });
};

// GET /api/fleet/vehicles
export const listVehicles = async (req, res) => {
  const { vehicles, pagination } = await fleetService.listVehicles(req.query);
  res.status(200).json({ success: true, count: vehicles.length, pagination, data: vehicles });
};

// GET /api/fleet/vehicles/:vehicleId
export const getVehicle = async (req, res) => {
  const vehicle = await fleetService.getVehicle(req.params.vehicleId);
  res.status(200).json({ success: true, data: vehicle });
};

// GET /api/fleet/vehicles/:vehicleId/availability
export const getAvailability = async (req, res) => {
  const availability = await fleetService.getAvailability(req.params.vehicleId);
  res.status(200).json({ success: true, data: availability });
};

// PATCH /api/fleet/vehicles/:vehicleId
export const updateVehicle = async (req, res) => {
  const data = matchedData(req, { locations: ['body'] });
  const vehicle = await fleetService.updateVehicleDetails(req.params.vehicleId, data);
  res.status(200).json({ success: true, message: 'Vehicle details updated', data: vehicle });
};

// PATCH /api/fleet/vehicles/:vehicleId/status
export const changeStatus = async (req, res) => {
  const { status, reason } = matchedData(req, { locations: ['body'] });
  const vehicle = await fleetService.changeStatus(req.params.vehicleId, status, reason, req.user);
  res.status(200).json({ success: true, message: `Vehicle status changed to ${vehicle.currentStatus}`, data: vehicle });
};

// PATCH /api/fleet/vehicles/:vehicleId/under-maintenance
export const markUnderMaintenance = async (req, res) => {
  const { reason } = matchedData(req, { locations: ['body'] });
  const vehicle = await fleetService.changeStatus(req.params.vehicleId, 'Under Maintenance', reason, req.user);
  res.status(200).json({ success: true, message: 'Vehicle marked as Under Maintenance', data: vehicle });
};

// PATCH /api/fleet/vehicles/:vehicleId/available
export const markAvailable = async (req, res) => {
  const { reason } = matchedData(req, { locations: ['body'] });
  const vehicle = await fleetService.changeStatus(req.params.vehicleId, 'Available', reason, req.user);
  res.status(200).json({ success: true, message: 'Vehicle marked as Available', data: vehicle });
};

// POST /api/fleet/vehicles/:vehicleId/return
export const returnVehicle = async (req, res) => {
  const data = matchedData(req, { locations: ['body'] });
  const { vehicle, maintenanceRecord } = await fleetService.processReturn(req.params.vehicleId, data, req.user);
  res.status(200).json({
    success: true,
    message: maintenanceRecord
      ? `Return processed. Vehicle needs attention and is now Under Maintenance (${maintenanceRecord.maintenanceId}).`
      : 'Return processed. Vehicle is Available for the next rental.',
    data: { vehicle, maintenanceRecord },
  });
};
