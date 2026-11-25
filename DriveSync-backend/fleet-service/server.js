// =============================================================
//  Fleet Management Service - entry point (Port 5005)
// =============================================================
import 'dotenv/config'; // load .env first
import app from './src/app.js';
import config from './src/config/env.js';
import { connectDB } from './src/config/db.js';

const startServer = async () => {
  await connectDB(config.mongoUri); // connect to drivesync_fleet_db before accepting requests

  app.listen(config.port, () => {
    console.log(`Fleet Management Service running on port ${config.port} (${config.nodeEnv})`);
  });
};

startServer();
