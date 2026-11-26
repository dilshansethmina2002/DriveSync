import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bookingRoutes from './routes/bookingRoutes.js';
import { connectKafka } from './config/kafka.js';
import { startBookingConsumer } from './events/bookingConsumer.js';

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
  .then(async () => {
    console.log('Booking DB Connected');
    try {
      await connectKafka();
      await startBookingConsumer();
    } catch (err) {
      console.warn('Kafka connection warning (running in REST-only mode):', err.message);
    }
    app.listen(PORT, () => console.log(`Booking Service running on port ${PORT}`));
  })
  .catch((err) => console.error('❌ Database connection error:', err.message));
