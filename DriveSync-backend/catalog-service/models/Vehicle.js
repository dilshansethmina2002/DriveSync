import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  brand: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  category: { type: String, required: true }, // e.g., SUV, Sedan
  dailyRate: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true },
  location: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Vehicle', vehicleSchema);