import mongoose from 'mongoose';

// টাইপ ডেফিনিশন: গ্লোবাল অবজেক্টে mongoose ক্যাশ রাখার জন্য
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // ১. মঙ্গো ইউআরআই চেক
  if (!process.env.MONGO_URI) {
    throw new Error('❌ FATAL ERROR: MONGO_URI is not defined in environment variables.');
  }

  // ২. যদি অলরেডি কানেকশন থাকে, তবে সেটিই রিটার্ন করবে (Performance Boost)
  if (cached.conn) {
    return cached.conn;
  }

  // ৩. নতুন কানেকশন তৈরি (যদি আগের প্রমিস না থাকে)
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false, // Serverless-এ বাফারিং বন্ধ রাখা ভালো
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