import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bookingRoutes from './routes/bookingRoutes.js';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// Health Check
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    success: true, 
    service: 'Booking Service', 
    status: 'Healthy',
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/api/bookings/health', (_req, res) => {
  res.status(200).json({ 
    success: true, 
    service: 'Booking Service', 
    status: 'Healthy',
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Routes
app.use('/api/bookings', bookingRoutes);

const PORT = process.env.PORT || 5003;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/drivesync_booking_db';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Booking DB Connected (drivesync_booking_db)');
    app.listen(PORT, () => console.log(`🚀 Booking Service running on port ${PORT}`));
  })
  .catch((err) => console.error('❌ Database connection error:', err.message));
