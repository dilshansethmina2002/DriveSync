import express from 'express';
import { 
    registerUser, 
    loginUser, 
    getUserProfile, 
    submitDocumentVerification, 
    verifyDocumentStatus, 
    getPendingVerifications,
    getAllUsers 
} from '../controllers/authController.js';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';
import { uploadLicense } from '../middleware/uploadMiddleware.js';

const authrouter = express.Router();

// Public Authentication Endpoints
authrouter.post('/register', registerUser);
authrouter.post('/login', loginUser);

// Customer Protected Endpoints
authrouter.get('/profile', verifyToken, getUserProfile);
authrouter.post('/verify-document', verifyToken, uploadLicense.single('document'), submitDocumentVerification);
authrouter.post('/upload-license', verifyToken, uploadLicense.single('document'), submitDocumentVerification);

// Admin Protected Endpoints
authrouter.get('/admin/verifications', verifyToken, requireAdmin, getPendingVerifications);
authrouter.patch('/admin/users/:id/verify', verifyToken, requireAdmin, verifyDocumentStatus);
authrouter.get('/admin/users', verifyToken, requireAdmin, getAllUsers);

export default authrouter;
