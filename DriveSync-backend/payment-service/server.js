// =============================================================
//  Payment Service - entry point (Port 5004)
//  1. Load environment variables
//  2. Connect to MongoDB (drivesync_payment_db)
//  3. Start the Express server
// =============================================================
import 'dotenv/config'; // loads .env into process.env (must be the first import)
import app from './src/app.js';
import config from './src/config/env.js';
import { connectDB } from './src/config/db.js';

const startServer = async () => {
  // We only start listening AFTER the database is connected,
  // so the API never accepts requests it cannot save.
  await connectDB(config.mongoUri);

  app.listen(config.port, () => {
    console.log(`Payment Service running on port ${config.port} (${config.nodeEnv})`);
  });
};

startServer();
