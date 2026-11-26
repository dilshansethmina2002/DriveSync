// =============================================================
//  Fleet Management Service - entry point (Port 5005)
// =============================================================
import 'dotenv/config'; // load .env first
import app from './src/app.js';
import config from './src/config/env.js';
import { connectDB } from './src/config/db.js';
import { connectKafka } from './src/config/kafka.js';
import { startFleetConsumer } from './src/events/fleetConsumer.js';

const startServer = async () => {
  await connectDB(config.mongoUri); // connect to drivesync_fleet_db before accepting requests

  // Connect to Kafka (falls back gracefully to REST-only mode if broker is down)
  try {
    await connectKafka();
    await startFleetConsumer();
  } catch (err) {
    console.warn('Kafka connection warning (running in REST-only mode):', err.message);
  }

  app.listen(config.port, () => {
    console.log(`Fleet Management Service running on port ${config.port} (${config.nodeEnv})`);
  });
};

startServer();