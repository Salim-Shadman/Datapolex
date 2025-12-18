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

// ENV Validation
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error('FATAL ERROR: MONGO_URI or JWT_SECRET is not defined in .env');
  // Vercel-এ process.exit() ব্যবহার না করাই ভালো, তবে লগ থাকা জরুরি
}

// Connect to Database (Non-blocking for serverless cold start)
connectDB();

const app = express();

// ===========================================
// 1. Security & Helmet
// ===========================================
app.use(helmet({ 
  crossOriginResourcePolicy: false, // ইমেজ বা ফাইল লোডের জন্য এটি ফলস রাখা জরুরি
}));

// ===========================================
// 2. CORS Configuration
// ===========================================
const allowedOrigins = [
  'http://localhost:3000', 
  process.env.CLIENT_URL, // .env থেকে ক্লায়েন্ট ইউআরএল
  'https://datapolex-client.vercel.app', 
  
  // Vercel Preview Deployments (Regex)
  /https:\/\/datapolex-client-git-.*\.vercel\.app$/,
  /https:\/\/datapolex-.*\.vercel\.app$/, 
].filter(Boolean); // undefined বা null ফিল্টার করে বাদ দেওয়া

app.use(cors({
  origin: (origin, callback) => {
    // সার্ভার-টু-সার্ভার রিকোয়েস্ট বা পোস্টম্যানের জন্য origin undefined হতে পারে
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some(ao => {
        if (ao instanceof RegExp) {
            return ao.test(origin);
        }
        return ao === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
}));

// ===========================================
// 3. Middleware
// ===========================================
app.use(compression()); // রেসপন্স সাইজ ছোট করার জন্য
app.use(express.json({ limit: '10kb' })); // বডি সাইজ লিমিট (DoS প্রোটেকশন)
app.use(sanitizeData); // NoSQL Injection প্রতিরোধ
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ===========================================
// 4. Rate Limiting (DDoS Protection)
// ===========================================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // ১৫ মিনিট
  max: 300, // লিমিট বাড়িয়ে ৩০০ করা হলো (API heavy অ্যাপের জন্য)
  standardHeaders: true, 
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // লগইন অ্যাটেম্পট লিমিট
  message: { message: 'Too many login attempts, please try again later' }
});
app.use('/api/auth', authLimiter);

//Routes
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
    message: 'Datapolex API is running securely.',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  }); 
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Local Development Server
if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });

  // Graceful Shutdown Logic
  const gracefulShutdown = () => {
    console.log('🔄 Received kill signal, shutting down gracefully...');
    server.close(() => {
      console.log('🛑 Closed out remaining connections.');
      mongoose.connection.close(false).then(() => {
          console.log('🍃 MongoDB connection closed.');
          process.exit(0);
      });
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

// Vercel Export
export default app;