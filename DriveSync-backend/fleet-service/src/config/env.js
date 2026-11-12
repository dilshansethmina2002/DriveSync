// =============================================================
//  Central place to read environment variables
// =============================================================
const required = ['MONGO_URI', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  console.error('Create a .env file (copy .env.example) and set them.');
  process.exit(1);
}

const config = {
  port: Number(process.env.PORT) || 5005,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  serviceApiKey: process.env.SERVICE_API_KEY || '',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  maintenanceIntervalDays: Number(process.env.MAINTENANCE_INTERVAL_DAYS) || 90,
};

export default config;
