import 'reflect-metadata';
import './infrastructure/config/container';
import { App } from './app';
import { env } from './infrastructure/config/env';
import { connectDB } from './infrastructure/config/db';
import { connectRedis } from './infrastructure/config/redis';

const app = new App()

const startServer = async () => {
    try {
        await connectDB()
        await connectRedis()
        app.listen(env.PORT)
    } catch (error) {
        console.error('Server failed to start:', error)
        process.exit(1)
    }
}

startServer()