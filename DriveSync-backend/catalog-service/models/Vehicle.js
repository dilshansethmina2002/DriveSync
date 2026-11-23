import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  brand: { type: String, required: true, trim: true },
  model: { type: String, required: true, trim: true },
  year: { type: Number, required: true },
  category: { type: String, required: true, trim: true }, // e.g., SUV, Sedan, Hatchback, Van
  dailyRate: { type: Number, required: true, min: 0 },
  isAvailable: { type: Boolean, default: true, index: true },
  location: { type: String, required: true, trim: true },
  imageUrl: { type: String, default: '' },
  fuelType: { type: String, default: 'Petrol' },
  transmission: { type: String, default: 'Automatic' },
  seats: { type: Number, default: 5 }
}, { timestamps: true });

export default mongoose.model('Vehicle', vehicleSchema);
