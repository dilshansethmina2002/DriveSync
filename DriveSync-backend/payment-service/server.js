// =============================================================
//  Payment Service - entry point (Port 5004)
//  1. Load environment variables
//  2. Connect to MongoDB (drivesync_payment_db)
//  3. Connect to Kafka & start consumer
//  4. Start the Express server
// =============================================================
import 'dotenv/config'; // loads .env into process.env (must be the first import)
import app from './src/app.js';
import config from './src/config/env.js';
import { connectDB } from './src/config/db.js';
import { connectKafka } from './src/config/kafka.js';
import { startPaymentConsumer } from './src/events/paymentConsumer.js';

const startServer = async () => {
  // We only start listening AFTER the database is connected,
  // so the API never accepts requests it cannot save.
  await connectDB(config.mongoUri);

  // Connect to Kafka (falls back gracefully to REST-only mode if broker is down)
  try {
    await connectKafka();
    await startPaymentConsumer();
  } catch (err) {
    console.warn('Kafka connection warning (running in REST-only mode):', err.message);
  }

  app.listen(config.port, () => {
    console.log(`Payment Service running on port ${config.port} (${config.nodeEnv})`);
  });
};

startServer();