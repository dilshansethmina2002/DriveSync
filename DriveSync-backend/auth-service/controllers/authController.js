import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// 1. Register User (Customer / Admin)
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Name, email, and password are required." });
        }

        let user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
            return res.status(400).json({ success: false, message: "User already exists with this email." });
        }

        user = new User({ 
            name, 
            email: email.toLowerCase(), 
            password, 
            role: role || 'Customer' 
        });
        await user.save();

        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(
            payload, 
            process.env.JWT_SECRET || 'drivesync_jwt_secret_key_2026_secure', 
            { expiresIn: '1d' }
        );

        res.status(201).json({ 
            success: true,
            message: "User registered successfully.",
            token,
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email, 
                role: user.role,
                isVerified: user.isVerified,
                documentStatus: user.documentStatus
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

// 2. Login User
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required." });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials." });
        }

        if (user.isActive === false) {
            return res.status(403).json({ success: false, message: "Your account has been suspended. Please contact an administrator." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials." });
        }

        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(
            payload, 
            process.env.JWT_SECRET || 'drivesync_jwt_secret_key_2026_secure', 
            { expiresIn: '1d' }
        );

        res.status(200).json({ 
            success: true,
            message: "Logged in successfully.",
            token, 
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email, 
                role: user.role,
                isVerified: user.isVerified,
                documentStatus: user.documentStatus,
                licenseNumber: user.licenseNumber,
                drivingLicenseUrl: user.drivingLicenseUrl
            } 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

// 3. Get Logged in User Profile (Protected Route)
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

// 4. Submit Driving License for Verification (Customer)
export const submitDocumentVerification = async (req, res) => {
    try {
        const userId = req.user.id;
        const { licenseNumber, drivingLicenseUrl } = req.body;

        let documentUrl = drivingLicenseUrl || '';
        
        // If a file was uploaded via multipart/form-data
        if (req.file) {
            documentUrl = `/uploads/licenses/${req.file.filename}`;
        }

        if (!licenseNumber && !documentUrl) {
            return res.status(400).json({ 
                success: false, 
                message: "Please provide either a license number or upload a document." 
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        if (licenseNumber) user.licenseNumber = licenseNumber;
        if (documentUrl) user.drivingLicenseUrl = documentUrl;
        user.documentStatus = 'Pending';
        user.isVerified = false;
        user.rejectionReason = '';

        await user.save();

        res.status(200).json({
            success: true,
            message: "Driving license submitted successfully. Verification pending admin review.",
            data: {
                licenseNumber: user.licenseNumber,
                drivingLicenseUrl: user.drivingLicenseUrl,
                documentStatus: user.documentStatus,
                isVerified: user.isVerified
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

// 5. Admin: Verify or Reject Customer Document
export const verifyDocumentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isVerified, rejectionReason } = req.body;

        if (typeof isVerified !== 'boolean') {
            return res.status(400).json({ 
                success: false, 
                message: "'isVerified' (boolean) is required in request body." 
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        if (isVerified) {
            user.isVerified = true;
            user.documentStatus = 'Verified';
            user.verifiedAt = new Date();
            user.verifiedBy = mongoose.isValidObjectId(req.user.id) ? req.user.id : null;
            user.rejectionReason = '';
        } else {
            user.isVerified = false;
            user.documentStatus = 'Rejected';
            user.rejectionReason = rejectionReason || 'Document could not be verified.';
            user.verifiedAt = null;
            user.verifiedBy = null;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: `User document has been ${isVerified ? 'verified' : 'rejected'}.`,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                documentStatus: user.documentStatus,
                isVerified: user.isVerified,
                rejectionReason: user.rejectionReason,
                verifiedAt: user.verifiedAt
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

// 6. Admin: Get Users Pending Verification
export const getPendingVerifications = async (req, res) => {
    try {
        const pendingUsers = await User.find({ documentStatus: 'Pending' })
            .select('-password')
            .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            count: pendingUsers.length,
            data: pendingUsers
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

// 7. Admin: Get All Users (with search & role filter)
export const getAllUsers = async (req, res) => {
    try {
        const { search, role } = req.query;
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (role) query.role = role;

        const users = await User.find(query).select('-password').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

// 8. Customer: Update Own Profile (name, phone, address)
export const updateUserProfile = async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        const updateData = {};
        if (name) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;

        const updated = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select('-password');
        if (!updated) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        res.status(200).json({ success: true, message: "Profile updated successfully.", data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

// 9. Admin: Update User Role
export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const allowed = ['Customer', 'Fleet Manager', 'Admin'];
        if (!allowed.includes(role)) {
            return res.status(400).json({ success: false, message: `Invalid role. Allowed: ${allowed.join(', ')}` });
        }

        const updated = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
        if (!updated) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        res.status(200).json({ success: true, message: `User role updated to ${role}.`, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

// 10. Admin: Activate / Suspend User Account
export const updateUserStatus = async (req, res) => {
    try {
        const { isActive } = req.body;
        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ success: false, message: "'isActive' (boolean) is required." });
        }

        const updated = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select('-password');
        if (!updated) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        res.status(200).json({ success: true, message: `User account ${isActive ? 'activated' : 'suspended'}.`, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};
