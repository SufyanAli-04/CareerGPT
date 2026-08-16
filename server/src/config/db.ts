import mongoose from 'mongoose';
import { env } from './env';

let isConnected = false;

const connectDB = async (): Promise<void> => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }

  if (!env.MONGO_URI || env.MONGO_URI.includes('127.0.0.1')) {
    throw new Error('MONGO_URI is missing or pointing to local 127.0.0.1 instead of MongoDB Atlas.');
  }

  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    isConnected = false;
    console.error('MongoDB connection error:', error.message);
    throw new Error(`MongoDB Connection Failed: ${error.message}`);
  }
};

export default connectDB;
