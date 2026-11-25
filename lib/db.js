import mongoose from "mongoose";

// Uses MONGODB_URI from .env.local if set (e.g. MongoDB Atlas), otherwise local MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/aaradhya_setu";

// Connect to MongoDB only once. Next.js reloads files during development,
// so we keep the connection promise on `global` and reuse it.
export function connectDB() {
  if (!global.mongoosePromise) {
    global.mongoosePromise = mongoose.connect(MONGODB_URI).catch((err) => {
      global.mongoosePromise = null; // allow a retry on the next request
      throw err;
    });
  }
  return global.mongoosePromise;
}
