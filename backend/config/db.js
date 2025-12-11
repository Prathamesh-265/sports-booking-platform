import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sports_booking';
  try {
    await mongoose.connect(uri, { dbName: 'sports_booking' });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
}
