import 'reflect-metadata';
import './infrastructure/config/containers/adminUseCaseContainer';
import './infrastructure/config/containers/amenitiesUseCaseContainer';
import './infrastructure/config/containers/authUseCaseContainer';
import './infrastructure/config/containers/bookingUseCaseContainer';
import './infrastructure/config/containers/chatUseCaseContainer';
import './infrastructure/config/containers/controllersContainer';
import './infrastructure/config/containers/couponUseCaseContainer';
import './infrastructure/config/containers/hotelUseCaseContainer';
import './infrastructure/config/containers/notificationUseCaseContainer';
import './infrastructure/config/containers/offerUseCaseContainer';
import './infrastructure/config/containers/ratingUseCaseContainer';
import './infrastructure/config/containers/repositoriesContainer';
import './infrastructure/config/containers/roomUseCaseContainer';
import './infrastructure/config/containers/servicesContainer';
import './infrastructure/config/containers/subscriptionUseCaseContainer';
import './infrastructure/config/containers/walletUseCaseContainer';

import { App } from './app';
import { env } from './infrastructure/config/env';
import { connectDB } from './infrastructure/config/db';
import { connectRedis } from './infrastructure/config/redis';
import { TOKENS } from './constants/token';
import { container } from 'tsyringe';
import { IPlatformFeeService } from './domain/interfaces/model/admin.interface';

const app = new App()

const startServer = async () => {
    try {
        await connectDB()
        await connectRedis()

        const platformFeeService = container.resolve<IPlatformFeeService>(TOKENS.PlatformFeeService);
        platformFeeService.scheduleCron();

        app.listen(env.PORT)
    } catch (error) {
        console.error('Server failed to start:', error)
        process.exit(1)
    }
}

startServer()