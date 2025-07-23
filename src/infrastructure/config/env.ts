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
    EMAIL: process.env.EMAIL,
    EMAIL_PASS: process.env.EMAIL_PASS,
    REDIS_USERNAME: process.env.REDIS_USERNAME!,
    REDIS_PASS: process.env.REDIS_PASS!,
    REDIS_HOST: process.env.REDIS_HOST!,
    REDIS_PORT: parseInt(process.env.REDIS_PORT!),
    CLIENT_URL: process.env.CLIENT_URL,
    GOOGLE_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME!,
    AWS_ACCESSKEYID: process.env.AWS_ACCESSKEYID!,
    AWS_SECRETACCESSKEY: process.env.AWS_SECRETACCESSKEY!,
    AWS_REGION: process.env.AWS_REGION!,
    STRIPE_SECRET: process.env.STRIPE_SECRET!,
}