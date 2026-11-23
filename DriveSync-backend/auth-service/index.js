import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

// Serve uploaded license documents statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB (drivesync_auth_db)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/drivesync_auth_db';
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Auth & User Service DB Connected (drivesync_auth_db)'))
    .catch(err => console.error('❌ DB Connection Error: ', err.message));

// Routes
app.use('/', authRoutes); 

app.get('/status', (_req, res) => { 
    res.status(200).json({ 
        success: true, 
        service: "Auth & User Service",
        status: "Online", 
        port: process.env.PORT || 5001 
    });
});

app.get('/health', (_req, res) => { 
    res.status(200).json({ 
        success: true, 
        service: "Auth & User Service",
        status: "Healthy", 
        dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Auth & User Service is running on port ${PORT}`);
});
