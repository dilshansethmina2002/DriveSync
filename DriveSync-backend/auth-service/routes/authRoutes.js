import express from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const authrouter = express.Router();

authrouter.post('/register', registerUser);
authrouter.post('/login', loginUser);
authrouter.get('/profile', verifyToken, getUserProfile);

export default authrouter;