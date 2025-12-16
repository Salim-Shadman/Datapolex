import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import mongoose from 'mongoose';
import connectDB from './config/db';

import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import sprintRoutes from './routes/sprintRoutes';
import taskRoutes from './routes/taskRoutes';
import userRoutes from './routes/userRoutes';
import uploadRoutes from './routes/uploadRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import { errorHandler } from './middleware/errorMiddleware';
import { sanitizeData } from './middleware/sanitizeMiddleware'; 

dotenv.config();

// FIX: Production Safety Check এ process.exit() রিমুভ করা হয়েছে
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error('FATAL ERROR: MONGO_URI or JWT_SECRET is not defined in .env (Check Vercel ENV)');
}

// Connect to Database
connectDB();

const app = express();

// 1. Security & Helmet
app.use(helmet({ 
  crossOriginResourcePolicy: false, 
}));

// ===========================================
// CRITICAL FIX: Robust CORS Configuration
// ===========================================
const allowedOrigins = [
  'http://localhost:3000', 
  process.env.CLIENT_URL,
  
  // FIX: ক্লায়েন্ট-এর লাইভ ডোমেইন
  'https://datapolex-client.vercel.app', 
  
  // CRITICAL FIX: Vercel প্রিভিউ ডোমেইন এবং অন্য কোনো Vercel ডোমেইন Allow করার জন্য RegEx
  /https:\/\/datapolex-client-git-.*\.vercel\.app$/,
  /https:\/\/datapolex-.*\.vercel\.app$/, 
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Check against explicit strings and RegEx patterns
    const isAllowed = allowedOrigins.some(ao => {
        if (ao instanceof RegExp) {
            return ao.test(origin || '');
        }
        return ao === origin;
    });

    if (!origin || isAllowed) {
      callback(null, true);
    } else {
      // FIX: Debugging এর জন্য স্পষ্ট এরর মেসেজ
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // FIX: Authorization header এবং x-requested-with header যোগ করা হলো
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
}));

// 2. Middleware
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(sanitizeData);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// 3. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200, 
  standardHeaders: true, 
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, 
  message: 'Too many login attempts, please try again later'
});
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health Check Route
app.get('/', (req, res) => { 
  res.status(200).json({ 
    status: 'active', 
    message: 'MPMS API is running securely on Vercel.',
    timestamp: new Date().toISOString()
  }); 
});

// Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// VERCEL DEPLOYMENT FIX (app.listen only for local)
if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });

  // Graceful Shutdown (Local-এ রাখা হলো)
  const gracefulShutdown = () => {
    console.log('🔄 Received kill signal, shutting down gracefully...');
    server.close(() => {
      console.log('🛑 Closed out remaining connections.');
      mongoose.connection.close(false).then(() => {
          console.log('🍃 MongoDB connection closed.');
      });
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

// Vercel এর জন্য app কে এক্সপোর্ট করা আবশ্যক
export default app;