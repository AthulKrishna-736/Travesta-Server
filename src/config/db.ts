import mongoose from "mongoose";
import { env } from './env';
import logger from '../utils/logger';

export const connectDB = async(): Promise<void> => {
    try {
        const connection = await mongoose.connect(env.MONGO_URI!)
        logger.info(`MongoDB connected: ${connection.connection.host}`)
    } catch (error) {
        logger.error('MongoDB connection error: ', error)
        throw new Error('Failed to connect to MongoDB')
    }
}