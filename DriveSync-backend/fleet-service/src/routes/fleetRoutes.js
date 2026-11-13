// =============================================================
//  Fleet routes (mounted at /api/fleet in app.js)
//
//  Who can do what:
//    Admin   -> everything (fleet staff work through an Admin account)
//    Service -> other microservices using x-service-key (e.g. Booking
//               Service marking a car Rented or processing a return)
//    Customer-> can only check availability
// =============================================================
import { Router } from 'express';
import * as vehicles from '../controllers/vehicleController.js';
import * as maintenance from '../controllers/maintenanceController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as rules from '../validators/fleetValidators.js';

const router = Router();
router.use(authenticate);

const staff = authorize('Admin', 'Service');
const adminOnly = authorize('Admin');

// ---------------- Vehicles ----------------
router.post('/vehicles', adminOnly, rules.registerVehicleRules, validate, vehicles.registerVehicle);
router.get('/vehicles', staff, rules.listVehiclesRules, validate, vehicles.listVehicles);
router.get('/vehicles/:vehicleId', staff, rules.vehicleIdRules, validate, vehicles.getVehicle);
router.patch('/vehicles/:vehicleId', adminOnly, rules.updateVehicleRules, validate, vehicles.updateVehicle);

// Any logged-in user (incl. customers) may ask "can this car be rented?"
router.get('/vehicles/:vehicleId/availability', rules.vehicleIdRules, validate, vehicles.getAvailability);

// ---------------- Status ----------------
router.patch('/vehicles/:vehicleId/status', staff, rules.changeStatusRules, validate, vehicles.changeStatus);
router.patch('/vehicles/:vehicleId/under-maintenance', adminOnly, rules.reasonOnlyRules, validate, vehicles.markUnderMaintenance);
router.patch('/vehicles/:vehicleId/available', adminOnly, rules.reasonOnlyRules, validate, vehicles.markAvailable);

// ---------------- Rental return ----------------
router.post('/vehicles/:vehicleId/return', staff, rules.returnVehicleRules, validate, vehicles.returnVehicle);

// ---------------- Maintenance ----------------
router.post('/vehicles/:vehicleId/maintenance', adminOnly, rules.recordMaintenanceRules, validate, maintenance.recordMaintenance);
router.get('/vehicles/:vehicleId/maintenance', staff, rules.vehicleMaintenanceListRules, validate, maintenance.getVehicleHistory);
router.get('/maintenance', adminOnly, rules.maintenanceListRules, validate, maintenance.getAllMaintenance);
router.get('/maintenance/:maintenanceId', adminOnly, rules.maintenanceIdRules, validate, maintenance.getMaintenance);
router.patch('/maintenance/:maintenanceId/complete', adminOnly, rules.completeMaintenanceRules, validate, maintenance.completeMaintenance);

export default router;
