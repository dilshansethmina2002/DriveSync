// =============================================================
//  Maintenance controller - logic is in maintenanceService
// =============================================================
import { matchedData } from 'express-validator';
import * as maintenanceService from '../services/maintenanceService.js';
import { producer } from '../config/kafka.js';

const publishVehicleStatusUpdated = async (vehicleId, status) => {
  try {
    await producer.send({
      topic: 'vehicle-status-updated',
      messages: [
        {
          key: vehicleId.toString(),
          value: JSON.stringify({ vehicleId, status }),
        },
      ],
    });
    console.log(`[Kafka] Published vehicle-status-updated (${status}) for ${vehicleId}`);
  } catch (kafkaErr) {
    console.error('[Kafka] Failed to publish vehicle-status-updated:', kafkaErr.message);
  }
};

// POST /api/fleet/vehicles/:vehicleId/maintenance
export const recordMaintenance = async (req, res) => {
  const data = matchedData(req, { locations: ['body'] });
  const { record, vehicle } = await maintenanceService.recordMaintenance(req.params.vehicleId, data, req.user);

  // Sync status with Catalog Service (e.g. 'Under Maintenance' -> isAvailable: false)
  await publishVehicleStatusUpdated(vehicle.vehicleId, vehicle.currentStatus);

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

  // Sync status with Catalog Service (e.g. 'Available' -> isAvailable: true)
  await publishVehicleStatusUpdated(vehicle.vehicleId, vehicle.currentStatus);

  res.status(200).json({ success: true, message, data: { maintenance: record, vehicle } });
};