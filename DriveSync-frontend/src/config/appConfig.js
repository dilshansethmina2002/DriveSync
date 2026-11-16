// =============================================================
//  Frontend configuration (values come from .env, see .env.example)
// =============================================================
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Mock mode = sample data inside the browser, clearly labelled in the UI
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const SECURITY_DEPOSIT = Number(import.meta.env.VITE_SECURITY_DEPOSIT) || 5000;
export const CURRENCY = import.meta.env.VITE_CURRENCY || 'LKR';

// Same lists as the backend validators (keep them in sync)
export const PAYMENT_STATUSES = ['Pending', 'Successful', 'Failed', 'Refunded'];
export const PAYMENT_TYPES = ['Rental Payment', 'Security Deposit'];
export const PAYMENT_METHODS = ['Credit Card', 'Debit Card', 'Online Wallet', 'Bank Transfer', 'Cash'];

export const VEHICLE_STATUSES = ['Available', 'Rented', 'Under Maintenance', 'Inactive'];
export const VEHICLE_CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'];
export const MAINTENANCE_TYPES = ['Routine Service', 'Repair', 'Inspection', 'Tyre Replacement', 'Oil Change', 'Cleaning', 'Other'];
export const MAINTENANCE_STATUSES = ['In Progress', 'Completed'];

// Vehicle status state machine - mirrors fleet-service/src/utils/statusTransitions.js
export const STATUS_TRANSITIONS = {
  Available: ['Rented', 'Under Maintenance', 'Inactive'],
  Rented: ['Available', 'Under Maintenance'],
  'Under Maintenance': ['Available', 'Inactive'],
  Inactive: ['Available', 'Under Maintenance'],
};
