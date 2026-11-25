import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  pickupTime: { type: String, default: '09:00' },
  returnTime: { type: String, default: '18:00' },
  pickupLocation: { type: String, default: '', trim: true },
  packageId: { type: mongoose.Schema.Types.ObjectId, default: null },
  packageName: { type: String, default: '' },
  driverRequired: { type: Boolean, default: false },
  notes: { type: String, default: '' },
  totalPrice: { type: Number, required: true, min: 0 },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Ongoing', 'Completed', 'Cancelled'], 
    default: 'Pending',
    index: true
  }
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
