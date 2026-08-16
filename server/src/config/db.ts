import mongoose from 'mongoose';
import { env } from './env';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error('MongoDB connection error:', error.message);
    console.error('Attempting to connect to:', env.MONGO_URI);
    console.error('Full error:', error);

    // Try to start MongoDB from the local data folder
    console.log('\n💡 Make sure MongoDB is running. You can:');
    console.log('   1. Start MongoDB from command line: mongod --dbpath="mongodb_data"');
    console.log('   2. Or verify MongoDB is running on port 27017\n');

    setTimeout(() => {
      console.log('🔄 Retrying database connection...');
      connectDB();
    }, 5000);
  }
};

export default connectDB;
