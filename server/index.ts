import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
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

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware - CORS (more permissive for same-origin deployment)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or same-origin)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
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

// Serve static files from React build in production
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Serve service worker and manifest from public folder
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
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
