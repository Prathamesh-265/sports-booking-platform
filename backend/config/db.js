
import mongoose from "mongoose";

export async function connectDB() {
  const uri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/sports_booking";

  const maxAttempts = 5;
  const retryDelayMs = 5000;

  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      attempt++;
      await mongoose.connect(uri);
      console.log("✅ MongoDB connected");
      return;
    } catch (err) {
      console.error(
        `MongoDB connection error (attempt ${attempt}/${maxAttempts}):`,
        err.message
      );

      if (attempt >= maxAttempts) {
        console.error("❌ All MongoDB connection attempts failed.");
        throw err;
      }

      await new Promise((res) => setTimeout(res, retryDelayMs));
    }
  }
}
