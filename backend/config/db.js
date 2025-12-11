import mongoose from "mongoose";


export async function connectDB() {
  const uri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/sports_booking";


  const envDb = process.env.MONGO_DB_NAME || process.env.DB_NAME;
  let parsedDbName = null;

  try {
    const m = uri.match(/\/([^/?]+)(\?|$)/);
    if (m && m[1]) parsedDbName = decodeURIComponent(m[1]);
  } catch (e) {
    
  }

  const dbName = envDb || parsedDbName || "sports_booking";

  const maxAttempts = 5;
  const retryDelayMs = 5000;

  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      attempt++;
      await mongoose.connect(uri, {
        dbName
      });

      console.log(`✅ MongoDB connected (db: ${dbName})`);
      return;
    } catch (err) {
      console.error(
        `MongoDB connection error (attempt ${attempt}/${maxAttempts}):`,
        err.message
      );

      if (attempt >= maxAttempts) {
        console.error(
          "❌ All MongoDB connection attempts failed. The server will keep running but DB functionality will be unavailable."
        );
        throw err;
      }

      await new Promise((res) => setTimeout(res, retryDelayMs));
    }
  }
}
