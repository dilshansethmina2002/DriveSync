// =============================================================
//  Maintenance record model  (collection: maintenances)
//
//  Why a separate model instead of an array inside Vehicle?
//  - History can grow forever; a MongoDB document has a 16 MB limit.
//  - We can search / paginate maintenance records on their own.
//  The Vehicle keeps a list of _ids pointing here (maintenanceHistory).
// =============================================================
import mongoose from 'mongoose';

export const MAINTENANCE_TYPES = [
  'Routine Service',
  'Repair',
  'Inspection',
  'Tyre Replacement',
  'Oil Change',
  'Cleaning',
  'Other',
];
export const MAINTENANCE_STATUSES = ['In Progress', 'Completed'];

const maintenanceSchema = new mongoose.Schema(
  {
    maintenanceId: { type: String, required: true, unique: true, index: true },

    // Link to the fleet vehicle (both forms, for easy querying)
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    vehicleId: { type: String, required: true, index: true },

    maintenanceType: { type: String, enum: MAINTENANCE_TYPES, required: true },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    status: { type: String, enum: MAINTENANCE_STATUSES, default: 'In Progress', index: true },

    cost: { type: Number, default: 0, min: 0 },
    serviceProvider: { type: String, trim: true, maxlength: 150 },
    mileageAtService: { type: Number, min: 0 },

    startDate: { type: Date, default: Date.now },
    completedDate: { type: Date, default: null },

    // If this maintenance was caused by a rental return
    relatedBookingId: { type: String, default: null },

    performedBy: { type: String }, // id of the staff/admin who recorded it
    completionNotes: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

maintenanceSchema.set('toJSON', { versionKey: false });

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);
export default Maintenance;
