import mongoose from 'mongoose';
import { env } from './env';

let isConnected = false;

const connectDB = async (): Promise<void> => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }

  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error('MongoDB connection error:', error.message);
  }
};

export default connectDB;
