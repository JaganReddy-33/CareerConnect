import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/job_listing_db';

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      process.stdout.write('MONGO_URI not set. Falling back to local MongoDB: mongodb://127.0.0.1:27017/job_listing_db\n');
    }

    const conn = await mongoose.connect(MONGO_URI);
    process.stdout.write(`MongoDB Connected: ${conn.connection.host}\n`);
    
    return conn;
  } catch (error) {
    process.stderr.write(`MongoDB connection error: ${error.message}\n`);
    process.exit(1);
  }
};

export const getGridFSBucket = async () => {
  const db = mongoose.connection;
  const { GridFSBucket } = await import('mongodb');
  return new GridFSBucket(db.db);
};
