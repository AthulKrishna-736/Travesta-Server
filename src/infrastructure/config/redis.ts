import { createClient } from 'redis';
import { env } from './env';
import logger from '../../utils/logger';

export const redisClient = createClient({
    username: env.REDIS_USERNAME,
    password: env.REDIS_PASS,
    socket: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        tls: env.NODE_ENV == 'production'
    }
});

redisClient.on('error', (error) => {
    logger.error('Redis Client Error: ', error)
})

export async function connectRedis() {
    try {
        await redisClient.connect();
        logger.info('Redis connected successfully')
    } catch (error) {
        logger.error('Redis connection failed: ', error)
        throw error;
    }
}
