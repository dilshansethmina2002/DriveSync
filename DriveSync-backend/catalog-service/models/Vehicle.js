import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  brand: { type: String, required: true, trim: true },
  model: { type: String, required: true, trim: true },
  year: { type: Number, required: true },
  category: { type: String, required: true, trim: true }, // e.g., Sedan, SUV, Hatchback, Van, Bike
  dailyRate: { type: Number, required: true, min: 0 },
  hourlyRate: { type: Number, default: 0, min: 0 },
  isAvailable: { type: Boolean, default: true, index: true },
  status: {
    type: String,
    enum: ['Available', 'Rented', 'Under Maintenance'],
    default: 'Available',
    index: true
  },
  location: { type: String, required: true, trim: true },
  imageUrl: { type: String, default: '' },
  fuelType: { type: String, default: 'Petrol' },
  transmission: { type: String, default: 'Automatic' },
  seats: { type: Number, default: 5 },
  luggageCapacity: { type: String, default: '2 Large Bags' },
  hasAC: { type: Boolean, default: true },
  mileageLimit: { type: String, default: '150 km / day' },
  extraFeatures: { type: [String], default: [] }
}, { timestamps: true });

export default mongoose.model('Vehicle', vehicleSchema);
