import { createClient } from 'redis';
import logger from '../utils/logger';
import { env } from './env';

const client = createClient({
    username: env.REDIS_USERNAME,
    password: env.REDIS_PASS,
    socket: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        tls: env.NODE_ENV == 'production'
    }
});

client.on('error', (error)=> {
    logger.error('Redis Client Error: ',error)
})

export async function connectRedis() {
    try {
        await client.connect();
        logger.info('Redis connected successfully')
    } catch (error: any) {
        logger.error('Redis connection failed: ', error)
        throw error;
    }
}
