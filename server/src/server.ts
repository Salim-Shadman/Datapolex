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


if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error('FATAL ERROR: MONGO_URI or JWT_SECRET is not defined in .env');
}



const app = express();


app.use(async (req, res, next) => {
  try {
    await connectDB(); //
    next();
  } catch (error) {
    console.error('Database Connection Failed via Middleware:', error);
    res.status(500).json({ message: 'Database connection failed' });
  }
});


app.use(helmet({ 
  crossOriginResourcePolicy: false, 
}));


const allowedOrigins = [
  'http://localhost:3000', 
  process.env.CLIENT_URL, 
  'https://datapolex-client.vercel.app', 
  
  
  /https:\/\/datapolex-client-git-.*\.vercel\.app$/,
  /https:\/\/datapolex-.*\.vercel\.app$/, 
].filter(Boolean); 

app.use(cors({
  origin: (origin, callback) => {
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

app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(sanitizeData);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 300, 
  standardHeaders: true, 
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, 
  message: { message: 'Too many login attempts, please try again later' }
});
app.use('/api/auth', authLimiter);


app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);


app.get('/', (req, res) => { 
  res.status(200).json({ 
    status: 'active', 
    message: 'Datapolex API is running securely.',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  }); 
});


app.use(errorHandler);

const PORT = process.env.PORT || 5000;


if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });

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


export default app;