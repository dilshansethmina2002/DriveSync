// =============================================================
//  MongoDB connection using Mongoose
// =============================================================
import dns from 'node:dns';
import mongoose from 'mongoose';

// Atlas "mongodb+srv://" strings need a DNS SRV lookup. On some Windows PCs
// (VPN / antivirus / local DNS proxy) Node's default DNS server refuses it:
//   "querySrv ECONNREFUSED _mongodb._tcp.cluster0...."
// Setting DNS_SERVERS=8.8.8.8,1.1.1.1 in .env makes Node use public DNS instead.
if (process.env.DNS_SERVERS) {
  dns.setServers(process.env.DNS_SERVERS.split(',').map((server) => server.trim()));
}

// Security: if someone sends { "$gt": "" } inside a value, Mongoose will
// treat it as plain data instead of a query operator (prevents NoSQL injection).
mongoose.set('sanitizeFilter', true);

export const connectDB = async (mongoUri) => {
  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`Fleet DB connected: ${conn.connection.name}`);
  } catch (error) {
    console.error('Fleet DB connection error:', error.message);
    process.exit(1); // no database = the service cannot work, so stop
  }
};
