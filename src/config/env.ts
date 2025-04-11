import dotenv from 'dotenv';
dotenv.config();

export const env = {
    PORT: parseInt(process.env.PORT || '5000'),
    NODE_ENV: process.env.NODE_ENV!,
    MONGO_URI: process.env.MONGO_URI!,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN!,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN!,
    REDIS_URL: process.env.REDIS_URL,
}