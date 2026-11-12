import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bookingRoutes from './routes/bookingRoutes.js';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// Routes
app.use('/api/bookings', bookingRoutes);

const PORT = process.env.PORT || 5003;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/drivesync_booking_db';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Booking DB Connected');
    app.listen(PORT, () => console.log(`Booking Service running on port ${PORT}`));
  })
  .catch((err) => console.error('Database connection error:', err));