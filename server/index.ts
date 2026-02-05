import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import notificationRoutes from './routes/notifications';
import timeEntryRoutes from './routes/timeEntries';
import pushRoutes from './routes/push';
import { errorHandler } from './middleware/errorHandler';
import { notificationScheduler } from './services/notificationScheduler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - Allow multiple origins for development and production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:3000',
  process.env.CLIENT_URL, // Automatically uses your Vercel URL when set in env
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // In production, log unauthorized origins for debugging
      if (process.env.NODE_ENV === 'production') {
        console.warn('Blocked by CORS:', origin);
      }
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/notifications', notificationRoutes);
app.use('/api/time-entries', timeEntryRoutes);
app.use('/api/push', pushRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mongodb: app.get('dbConnected') ? 'connected' : 'disconnected'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    app.set('dbConnected', true);
    // Initialize notification scheduler
    await notificationScheduler.initialize();
    
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 API endpoint: http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
