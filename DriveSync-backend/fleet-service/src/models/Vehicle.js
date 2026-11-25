// =============================================================
//  Fleet Vehicle model  (collection: vehicles, DB: drivesync_fleet_db)
//
//  This is NOT the same as the Catalog Service's Vehicle (Member 2).
//  - Catalog  = what customers see (brand, price, location...)
//  - Fleet    = the OPERATIONAL side (status, condition, maintenance)
//  Both use the same vehicleId (the catalog vehicle's _id) so the
//  services can talk about the same car without sharing a database.
// =============================================================
import mongoose from 'mongoose';
import { VEHICLE_STATUSES } from '../utils/statusTransitions.js';

export const VEHICLE_CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'];

const vehicleSchema = new mongoose.Schema(
  {
    // Shared ID (the vehicle's _id in the Catalog Service)
    vehicleId: { type: String, required: true, unique: true, index: true, trim: true },
    vehicleName: { type: String, required: true, trim: true, maxlength: 100 },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true, // "cab-1234" is saved as "CAB-1234"
      trim: true,
    },

    currentStatus: { type: String, enum: VEHICLE_STATUSES, default: 'Available', index: true },
    condition: { type: String, enum: VEHICLE_CONDITIONS, default: 'Good' },
    mileage: { type: Number, default: 0, min: 0 }, // km on the odometer

    lastMaintenanceDate: { type: Date, default: null },
    nextMaintenanceDate: { type: Date, default: null },

    // References to Maintenance documents (same database, so a ref is fine here)
    maintenanceHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Maintenance' }],

    // Info about the most recent rental return
    lastReturn: {
      bookingId: { type: String },
      returnedAt: { type: Date },
      conditionOnReturn: { type: String, enum: VEHICLE_CONDITIONS },
      mileageOnReturn: { type: Number },
      notes: { type: String },
    },

    // Audit trail of every status change
    statusHistory: [
      {
        _id: false,
        from: String,
        to: String,
        reason: String,
        changedBy: String,
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

vehicleSchema.set('toJSON', { versionKey: false });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
