import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
 
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found (Invalid ID)';
  }

  
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }


  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val: any) => val.message).join(', ');
  }

 
  console.error('\n================ ❌ ERROR OCCURRED ❌ ================');
  console.error(`📍 Route       : ${req.method} ${req.originalUrl}`);
  console.error(`🔢 Status Code : ${statusCode}`);
  console.error(`💬 Message     : ${message}`);
  
  
  if (err.stack) {
    console.error(`📜 Stack Trace :`);
    console.error(err.stack);
  } else {
    console.error(`📜 Stack Trace : No stack trace available`);
  }
  console.error('======================================================\n');

  res.status(statusCode).json({
    message,
    
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export { errorHandler };