import 'reflect-metadata';
import './config/container';
import { App } from './app';
import { env } from './config/env';
import { connectDB } from './config/db';
import { connectRedis } from './config/redis';

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