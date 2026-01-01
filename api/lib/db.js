const mongoose = require("mongoose");

let cached = global.__mongoose__;
if (!cached) {
  cached = global.__mongoose__ = { conn: null, promise: null };
}

async function connectDB(uri) {
  if (!uri) throw new Error("MONGODB_URI missing");

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connectDB };