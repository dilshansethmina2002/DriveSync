import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import catalogRoutes from './routes/catalogRoutes.js';
import { connectKafka } from './config/kafka.js';
import { startCatalogConsumer } from './events/catalogConsumer.js';
import packageRoutes from './routes/packageRoutes.js';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// Health Check
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    success: true, 
    service: 'Catalog & Inventory Service', 
    status: 'Healthy',
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/api/catalog/health', (_req, res) => {
  res.status(200).json({ 
    success: true, 
    service: 'Catalog & Inventory Service', 
    status: 'Healthy',
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Routes (mount /packages before /:id routes)
app.use('/api/catalog/packages', packageRoutes);
app.use('/api/catalog', catalogRoutes);

const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/drivesync_catalog_db';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Catalog & Inventory DB Connected');
    try {
      await connectKafka();
      await startCatalogConsumer();
    } catch (err) {
      console.warn('Kafka connection warning (running in REST-only mode):', err.message);
    }
    app.listen(PORT, () => console.log(`Catalog Service running on port ${PORT}`));
  })
  .catch((err) => console.error('❌ Database connection error:', err.message));
