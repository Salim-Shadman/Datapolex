import mongoose from 'mongoose';


let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  
  if (!process.env.MONGO_URI) {
    throw new Error('❌ FATAL ERROR: MONGO_URI is not defined in environment variables.');
  }

  
  if (cached.conn) {
    return cached.conn;
  }

  
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false, 
    };

    cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((mongoose) => {
      console.log(`✅ New MongoDB Connected: ${mongoose.connection.host}`);
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB Connection Error:', e);
    throw e;
  }

  return cached.conn;
};

export default connectDB;