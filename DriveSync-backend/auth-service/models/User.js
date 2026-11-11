import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'Customer' },
    drivingLicenseUrl: { type: String, default: '' },
    isVerified: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return; 
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
export default User;