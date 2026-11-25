import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly', 'Wedding', 'Airport Transfer', 'Weekend'],
    default: 'Daily'
  },
  price: { type: Number, required: true, min: 0 },
  discountPercent: { type: Number, default: 0, min: 0, max: 100 },
  includedMileage: { type: String, default: 'Unlimited' },
  description: { type: String, default: '' },
  perks: { type: [String], default: [] },
  isActive: { type: Boolean, default: true, index: true }
}, { timestamps: true });

export default mongoose.model('Package', packageSchema);
