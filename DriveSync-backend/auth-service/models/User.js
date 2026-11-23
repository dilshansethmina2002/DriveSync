import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, default: 'Customer', enum: ['Customer', 'Admin'] },
    
    // Document Verification Fields
    licenseNumber: { type: String, default: '', trim: true },
    drivingLicenseUrl: { type: String, default: '' },
    documentStatus: { 
        type: String, 
        enum: ['Not Submitted', 'Pending', 'Verified', 'Rejected'], 
        default: 'Not Submitted' 
    },
    isVerified: { type: Boolean, default: false },
    rejectionReason: { type: String, default: '' },
    verifiedAt: { type: Date, default: null },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return; 
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
export default User;
