// =============================================================
//  Express application setup (middlewares + routes)
//  Kept separate from server.js so the app can be tested without
//  opening a real network port.
// =============================================================
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import config from './config/env.js';
import fleetRoutes from './routes/fleetRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

// ---------- Security middlewares ----------
app.use(helmet()); // sets safe HTTP headers
app.use(
  cors({
    // Requests with no Origin header (Postman, other services) are allowed.
    // Browsers are only allowed from the origins listed in CORS_ORIGINS.
    origin: (origin, callback) => {
      if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 300, // max requests per IP in that window
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later' },
  })
);

// ---------- Body parsing & logging ----------
app.use(express.json({ limit: '10kb' })); // small limit: fleet requests are small
if (config.nodeEnv !== 'test') app.use(morgan('dev')); // logs: GET /api/fleet/vehicles 200 12ms

// ---------- Health check (no login needed) ----------
// Useful for the API Gateway / teammates to see if the service is alive.
app.get('/api/fleet/health', (_req, res) => {
  res.status(200).json({
    success: true,
    service: 'fleet-service',
    status: 'UP',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// ---------- Routes ----------
app.use('/api/fleet', fleetRoutes);

// ---------- Errors (must be LAST) ----------
app.use(notFound);
app.use(errorHandler);

export default app;
