import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression'; // NEW IMPORT
import connectDB from './config/db';

import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import sprintRoutes from './routes/sprintRoutes';
import taskRoutes from './routes/taskRoutes';
import userRoutes from './routes/userRoutes';
import uploadRoutes from './routes/uploadRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import { errorHandler } from './middleware/errorMiddleware';

dotenv.config();
connectDB();

const app = express();

// 1. COMPRESSION: Makes API responses 70% smaller (Superfast)
app.use(compression());

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(morgan('dev'));

// 2. RATE LIMITING: Prevent Brute Force Attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, 
  legacyHeaders: false,
});
app.use(limiter);

// Stricter limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, 
  message: 'Too many login attempts, please try again after 15 minutes'
});
app.use('/api/auth', authLimiter);

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
app.listen(PORT, () => {
  console.log(`🚀 Server running superfast on port ${PORT}`);
});