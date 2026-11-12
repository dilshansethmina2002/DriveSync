import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import catalogRoutes from './routes/catalogRoutes.js';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// Routes
app.use('/api/catalog', catalogRoutes);

const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/drivesync_catalog_db';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Catalog & Inventory DB Connected');
    app.listen(PORT, () => console.log(`Catalog Service running on port ${PORT}`));
  })
  .catch((err) => console.error('Database connection error:', err));