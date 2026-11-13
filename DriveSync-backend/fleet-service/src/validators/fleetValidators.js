// =============================================================
//  Request validation rules for the Fleet Management Service
// =============================================================
import { body, param, query } from 'express-validator';
import { VEHICLE_STATUSES } from '../utils/statusTransitions.js';
import { VEHICLE_CONDITIONS } from '../models/Vehicle.js';
import { MAINTENANCE_TYPES, MAINTENANCE_STATUSES } from '../models/Maintenance.js';

const list = (values) => values.join(', ');

// vehicleId = the Catalog Service's vehicle _id (24 hex characters)
const vehicleIdParam = param('vehicleId').trim().isMongoId().withMessage('vehicleId must be a valid 24-character ID');
const maintenanceIdParam = param('maintenanceId')
  .trim()
  .matches(/^MNT-\d{8}-[A-F0-9]{8}$/)
  .withMessage('maintenanceId format must look like MNT-20261112-1A2B3C4D');

// Sri Lankan style plates such as "CAB-1234", "WP CAB-1234", "65-4321"
const registrationRule = (chain) =>
  chain
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('registrationNumber must be 2-20 characters')
    .matches(/^[A-Za-z0-9\- ]+$/)
    .withMessage('registrationNumber can contain only letters, numbers, spaces and dashes');

const conditionRule = (chain) => chain.isIn(VEHICLE_CONDITIONS).withMessage(`condition must be one of: ${list(VEHICLE_CONDITIONS)}`);

const futureOrAnyDate = (field) => body(field).optional().isISO8601().withMessage(`${field} must be a date like 2026-12-31`).toDate();

export const paginationRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive whole number'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
];

// ---------------- Vehicles ----------------
export const registerVehicleRules = [
  body('vehicleId').trim().isMongoId().withMessage('vehicleId must be the 24-character vehicle ID from the Catalog Service'),
  body('vehicleName').trim().notEmpty().withMessage('vehicleName is required').isLength({ max: 100 }).escape(),
  registrationRule(body('registrationNumber').exists().withMessage('registrationNumber is required')),
  body('currentStatus')
    .optional()
    .isIn(['Available', 'Under Maintenance', 'Inactive'])
    .withMessage('A new vehicle can start as Available, Under Maintenance or Inactive'),
  conditionRule(body('condition').optional()),
  body('mileage').optional().isInt({ min: 0 }).withMessage('mileage must be 0 or more').toInt(),
  futureOrAnyDate('lastMaintenanceDate'),
  futureOrAnyDate('nextMaintenanceDate'),
];

export const listVehiclesRules = [
  ...paginationRules,
  query('status').optional().isIn(VEHICLE_STATUSES).withMessage(`status must be one of: ${list(VEHICLE_STATUSES)}`),
  query('condition').optional().isIn(VEHICLE_CONDITIONS).withMessage(`condition must be one of: ${list(VEHICLE_CONDITIONS)}`),
  query('search').optional().trim().isLength({ max: 50 }),
  query('dueForMaintenance').optional().isIn(['true', 'false']),
];

export const vehicleIdRules = [vehicleIdParam];

export const updateVehicleRules = [
  vehicleIdParam,
  body('vehicleName').optional().trim().notEmpty().isLength({ max: 100 }).escape(),
  registrationRule(body('registrationNumber').optional()),
  conditionRule(body('condition').optional()),
  body('mileage').optional().isInt({ min: 0 }).withMessage('mileage must be 0 or more').toInt(),
  futureOrAnyDate('nextMaintenanceDate'),
  body('currentStatus').not().exists().withMessage('Use PATCH /vehicles/:vehicleId/status to change the status'),
];

export const changeStatusRules = [
  vehicleIdParam,
  body('status').isIn(VEHICLE_STATUSES).withMessage(`status must be one of: ${list(VEHICLE_STATUSES)}`),
  body('reason').optional().trim().isLength({ max: 300 }).escape(),
];

// Used by /under-maintenance and /available (status comes from the URL)
export const reasonOnlyRules = [vehicleIdParam, body('reason').optional().trim().isLength({ max: 300 }).escape()];

export const returnVehicleRules = [
  vehicleIdParam,
  body('bookingId').trim().isMongoId().withMessage('bookingId must be a valid 24-character ID'),
  conditionRule(body('condition').exists().withMessage('condition is required')),
  body('mileage').optional().isInt({ min: 0 }).withMessage('mileage must be 0 or more').toInt(),
  body('needsMaintenance').optional().isBoolean({ strict: true }).withMessage('needsMaintenance must be true or false'),
  body('damageNotes').optional().trim().isLength({ max: 1000 }).escape(),
  body('notes').optional().trim().isLength({ max: 1000 }).escape(),
];

// ---------------- Maintenance ----------------
export const recordMaintenanceRules = [
  vehicleIdParam,
  body('maintenanceType').isIn(MAINTENANCE_TYPES).withMessage(`maintenanceType must be one of: ${list(MAINTENANCE_TYPES)}`),
  body('description').trim().notEmpty().withMessage('description is required').isLength({ max: 1000 }).escape(),
  body('status').optional().isIn(MAINTENANCE_STATUSES).withMessage(`status must be one of: ${list(MAINTENANCE_STATUSES)}`),
  body('cost').optional().isFloat({ min: 0 }).withMessage('cost must be 0 or more').toFloat(),
  body('serviceProvider').optional().trim().isLength({ max: 150 }).escape(),
  body('mileageAtService').optional().isInt({ min: 0 }).toInt(),
  futureOrAnyDate('startDate'),
  futureOrAnyDate('completedDate'),
  body('completionNotes').optional().trim().isLength({ max: 1000 }).escape(),
];

export const maintenanceListRules = [
  ...paginationRules,
  query('status').optional().isIn(MAINTENANCE_STATUSES).withMessage(`status must be one of: ${list(MAINTENANCE_STATUSES)}`),
  query('type').optional().isIn(MAINTENANCE_TYPES).withMessage(`type must be one of: ${list(MAINTENANCE_TYPES)}`),
];

export const vehicleMaintenanceListRules = [vehicleIdParam, ...maintenanceListRules];

export const maintenanceIdRules = [maintenanceIdParam];

export const completeMaintenanceRules = [
  maintenanceIdParam,
  body('cost').optional().isFloat({ min: 0 }).withMessage('cost must be 0 or more').toFloat(),
  body('completionNotes').optional().trim().isLength({ max: 1000 }).escape(),
  conditionRule(body('condition').optional()),
  futureOrAnyDate('nextMaintenanceDate'),
  body('makeAvailable').optional().isBoolean({ strict: true }).withMessage('makeAvailable must be true or false'),
];
