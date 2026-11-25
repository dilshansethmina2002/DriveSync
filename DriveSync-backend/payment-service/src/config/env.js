// =============================================================
//  Central place to read environment variables.
//  Every other file imports values from here instead of
//  reading process.env directly, so all settings live in one spot.
// =============================================================

// Stop the service immediately if a critical setting is missing.
// Failing early is better than failing later with a confusing error.
const required = ['MONGO_URI', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  console.error('Create a .env file (copy .env.example) and set them.');
  process.exit(1);
}

const config = {
  port: Number(process.env.PORT) || 5004,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  serviceApiKey: process.env.SERVICE_API_KEY || '',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  defaultCurrency: process.env.DEFAULT_CURRENCY || 'LKR',
  bookingServiceUrl: process.env.BOOKING_SERVICE_URL || 'http://localhost:5003',
  verifyBooking: process.env.VERIFY_BOOKING === 'true',
  notifyBookingOnPayment: process.env.NOTIFY_BOOKING_ON_PAYMENT === 'true',
  gatewayDelayMs: Number(process.env.GATEWAY_DELAY_MS ?? 300),
};

export default config;
