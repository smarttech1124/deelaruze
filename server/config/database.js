const mongoose = require('mongoose');

// Serverless-safe global cache — persists across warm invocations
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {

  // Return existing connection only if socket is genuinely open (readyState 1)
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If a previous promise failed, clear it so we can retry cleanly
  if (cached.promise && mongoose.connection.readyState === 0) {
    cached.promise = null;
    cached.conn    = null;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000, // fail fast if Atlas is unreachable
        socketTimeoutMS:          45000, // keep alive for long transactions
        maxPoolSize:              10,    // safe ceiling for serverless concurrency
        minPoolSize:              1,     // keep one socket warm between invocations
        connectTimeoutMS:         10000,
      })
      .then((m) => {
        console.log('✅ MongoDB connected');
        return m.connection;
      })
      .catch((err) => {
        // Clear the cached promise so the next request can attempt a fresh connect
        cached.promise = null;
        cached.conn    = null;
        console.error('❌ MongoDB connection failed:', err.message);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = dbConnect;