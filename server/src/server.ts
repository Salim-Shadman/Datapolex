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

// স্যানিটাইজার ইম্পোর্ট (যদি ফাইলটি থাকে)
// import { sanitizeData } from './middleware/sanitizeMiddleware'; 

dotenv.config();
connectDB();

const app = express();

// 1. CORS FIX: এটিকে সবার প্রথমে রাখুন এবং 'origin: true' দিন
app.use(cors({
  origin: true, // অটোমেটিক রিকোয়েস্টের অরিজিন এক্সেপ্ট করবে
  credentials: true, // কুকিজ এবং হেডার এলাউ করবে
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. অন্যান্য মিডলওয়্যার
app.use(compression());
app.use(express.json());
// app.use(sanitizeData); // যদি ফাইল থাকে তবেই এটি আনকমেন্ট করুন
app.use(helmet({ crossOriginResourcePolicy: false })); // Helmet CORS পলিসি ডিজেবল করা হলো
app.use(morgan('dev'));

// 3. Rate Limiting (একটু বাড়িয়ে দেওয়া হলো যাতে লগইনে সমস্যা না হয়)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200, // 100 থেকে বাড়িয়ে 200 করা হলো
  standardHeaders: true, 
  legacyHeaders: false,
});
app.use(limiter);

// Auth Limiter (লগইন এরর কমানোর জন্য লিমিট বাড়ানো হলো)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // 20 থেকে বাড়িয়ে 50 করা হলো
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

app.get('/', (req, res) => { res.send('MPMS API is running fast & secure...'); });

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running with CORS FIXED on port ${PORT}`);
});

// Graceful Shutdown
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