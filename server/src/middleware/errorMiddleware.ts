import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Default to 500 server error
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found (Invalid ID)';
  }

  // Mongoose Duplicate Key
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val: any) => val.message).join(', ');
  }

  // =========================================================
  // IMPROVED LOGGING: Console-এ বিস্তারিত দেখার জন্য
  // =========================================================
  console.error('\n================ ❌ ERROR OCCURRED ❌ ================');
  console.error(`📍 Route       : ${req.method} ${req.originalUrl}`);
  console.error(`🔢 Status Code : ${statusCode}`);
  console.error(`💬 Message     : ${message}`);
  
  // Stack trace দেখাটা ডিবাগিংয়ের জন্য সবচেয়ে জরুরি
  if (err.stack) {
    console.error(`📜 Stack Trace :`);
    console.error(err.stack);
  } else {
    console.error(`📜 Stack Trace : No stack trace available`);
  }
  console.error('======================================================\n');

  res.status(statusCode).json({
    message,
    // Production-এ ইউজারকে Stack দেখাবো না, কিন্তু ওপরে Console-এ ঠিকই প্রিন্ট হবে
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export { errorHandler };