import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);
    
    // Check if MONGO_URI exists before connecting
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not defined in environment variables.');
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // as mongoose.ConnectOptions is correct for type safety
    } as mongoose.ConnectOptions); 

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle Connection Events
    mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected! Attempting to reconnect...');
    });

    mongoose.connection.on('error', (err) => {
        console.error(`⚠️ MongoDB connection error: ${err}`);
    });

  } catch (error: any) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // FIX: Vercel-এ process.exit(1) রিমুভ করা হলো। Vercel নিজে থেকেই ক্র্যাশ হ্যান্ডেল করবে।
    // process.exit(1); 
  }
};

export default connectDB;