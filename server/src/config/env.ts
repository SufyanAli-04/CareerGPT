import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || '5000',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/careergpt',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
};
