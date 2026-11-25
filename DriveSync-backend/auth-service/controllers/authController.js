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

// 7. Admin: Get All Users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};
