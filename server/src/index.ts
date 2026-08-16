import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db';
import { env } from './config/env';
import errorHandler from './middleware/errorHandler';

// Routes
import authRoutes from './routes/authRoutes';
import resumeRoutes from './routes/resumeRoutes';
import chatbotRoutes from './routes/chatbotRoutes';
import interviewRoutes from './routes/interviewRoutes';
import roadmapRoutes from './routes/roadmapRoutes';
import notesRoutes from './routes/notesRoutes';
import jobsRoutes from './routes/jobsRoutes';
import stripeRoutes from './routes/stripeRoutes';
import adminRoutes from './routes/adminRoutes';
import bookingRoutes from './routes/bookingRoutes';

const app = express();

// Ensure DB connection middleware for serverless
app.use(async (req, res, next) => {
  if (req.path === '/' || req.path === '/api/health') {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (err: any) {
    console.error('DB middleware error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Database connection error. Please verify MONGO_URI and MongoDB Atlas IP access rules.',
    });
  }
});

// ─── Middleware ────────────────────────────────────────────────────────────────
const allowedOrigins = env.CLIENT_URL
  ? env.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/$/, ''))
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, '');
      if (
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith('.vercel.app') ||
        env.NODE_ENV === 'development'
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (env.NODE_ENV === 'development') app.use(morgan('dev'));

// ─── Root Route ───────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ status: 'OK', message: 'CareerGPT API is live and running 🚀' });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  let dbStatus = 'Disconnected';
  try {
    await connectDB();
    dbStatus = 'Connected';
  } catch (e: any) {
    dbStatus = `Connection Error: ${e.message}`;
  }
  res.json({ status: 'OK', message: 'CareerGPT API is running 🚀', database: dbStatus });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Error Handler (must be last) ─────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
if (!process.env.VERCEL) {
  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`);
  });
}

export default app;
