import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend (local dev + Vercel production/previews + env overrides)
const defaultOrigins = [
  'http://localhost:5173',
  'https://drivesynccodecraft.vercel.app',
];

const envOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/+$/, '');
    if (
      allowedOrigins.includes(cleanOrigin) ||
      /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(cleanOrigin)
    ) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-service-key', 'x-calling-service'],
};

app.use(cors(corsOptions));

// Helper to handle proxy errors gracefully when microservices are down
const handleProxyError = (serviceName) => (err, req, res) => {
  console.error(`[API Gateway Error] Failed to proxy ${req.method} ${req.originalUrl} to ${serviceName}:`, err.message);
  if (!res.headersSent) {
    res.status(503).json({
      success: false,
      message: `The ${serviceName} is currently unavailable (${err.code || 'ECONNREFUSED'}). Please make sure the service is running.`,
      service: serviceName,
      error: err.message,
    });
  }
};

// Helper to preserve the route prefix for services that mount their routers at /api/*
const preservePrefix = (prefix) => (path) => {
  if (path === '' || path === '/') return prefix;
  if (path.startsWith('/?')) return prefix + path.slice(1);
  return prefix + (path.startsWith('/') ? path : '/' + path);
};

// =============================================================
// Microservice Routes Configuration
// =============================================================

// 1. Member 1: Auth & User Service (Port 5001)
// Note: Auth service mounts routes at '/' (/login, /register, /profile)
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
app.use(
  '/api/auth',
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    on: {
      error: handleProxyError('Auth & User Service (Port 5001)'),
    },
  })
);

// 2. Member 2: Catalog & Inventory Service (Port 5002)
// Note: Catalog service mounts routes at '/api/catalog'
const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || 'http://localhost:5002';
app.use(
  '/api/catalog',
  createProxyMiddleware({
    target: CATALOG_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: preservePrefix('/api/catalog'),
    on: {
      error: handleProxyError('Catalog & Inventory Service (Port 5002)'),
    },
  })
);

// 3. Member 2: Booking Service (Port 5003)
// Note: Booking service mounts routes at '/api/bookings'
const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:5003';
app.use(
  '/api/bookings',
  createProxyMiddleware({
    target: BOOKING_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: preservePrefix('/api/bookings'),
    on: {
      error: handleProxyError('Booking Service (Port 5003)'),
    },
  })
);

// 4. Member 3: Payment Service (Port 5004)
// Note: Payment service mounts routes at '/api/payments'
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:5004';
app.use(
  '/api/payments',
  createProxyMiddleware({
    target: PAYMENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: preservePrefix('/api/payments'),
    on: {
      error: handleProxyError('Payment Service (Port 5004)'),
    },
  })
);

// 5. Member 3: Fleet Management Service (Port 5005)
// Note: Fleet service mounts routes at '/api/fleet'
const FLEET_SERVICE_URL = process.env.FLEET_SERVICE_URL || 'http://localhost:5005';
app.use(
  '/api/fleet',
  createProxyMiddleware({
    target: FLEET_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: preservePrefix('/api/fleet'),
    on: {
      error: handleProxyError('Fleet Management Service (Port 5005)'),
    },
  })
);

// =============================================================
// Gateway Health & Status Endpoints
// =============================================================
const getStatusData = () => ({
  status: 'Online',
  service: 'DriveSync API Gateway',
  port: PORT,
  timestamp: new Date().toISOString(),
  routes: {
    auth: { path: '/api/auth', target: AUTH_SERVICE_URL, member: 'Member 1' },
    catalog: { path: '/api/catalog', target: CATALOG_SERVICE_URL, member: 'Member 2' },
    bookings: { path: '/api/bookings', target: BOOKING_SERVICE_URL, member: 'Member 2' },
    payments: { path: '/api/payments', target: PAYMENT_SERVICE_URL, member: 'Member 3' },
    fleet: { path: '/api/fleet', target: FLEET_SERVICE_URL, member: 'Member 3' },
  },
});

app.get('/', (_req, res) => {
  res.status(200).json(getStatusData());
});

app.get('/health', (_req, res) => {
  res.status(200).json(getStatusData());
});

app.get('/api/health', (_req, res) => {
  res.status(200).json(getStatusData());
});

// Fallback 404 for unmapped gateway paths
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' not found on API Gateway. Check your endpoint path.`,
  });
});

app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 DriveSync API Gateway running on port ${PORT}`);
  console.log('====================================================');
  console.log(`  [Member 1] /api/auth     -> ${AUTH_SERVICE_URL}`);
  console.log(`  [Member 2] /api/catalog  -> ${CATALOG_SERVICE_URL}`);
  console.log(`  [Member 2] /api/bookings -> ${BOOKING_SERVICE_URL}`);
  console.log(`  [Member 3] /api/payments -> ${PAYMENT_SERVICE_URL}`);
  console.log(`  [Member 3] /api/fleet    -> ${FLEET_SERVICE_URL}`);
  console.log('====================================================');
});
