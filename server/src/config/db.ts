import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);
    
    const conn = await mongoose.connect(process.env.MONGO_URI || '', {
      // These options are now default in Mongoose 6+, but good for clarity if using older versions
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
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
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;