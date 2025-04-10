import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import logger from './utils/logger';
import { env } from './config/env';
import { userRoutes } from './interfaces/routes/userRoutes';
import { vendorRoutes } from './interfaces/routes/vendorRoutes';
import { adminRoutes } from './interfaces/routes/adminRoutes';

export class App {
  public app: Application

  constructor() {
    this.app = express()
    this.setSecurityMiddlewares()
    this.setGlobalMiddlewares()
    this.setRoutes()
    this.setErrorHandling()
  }

  private setSecurityMiddlewares(): void {
    this.app.use(helmet())
    this.app.use(cors())
    this.app.use(mongoSanitize());
    this.app.use(hpp())

    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many requests from this IP, please try again later.',
    })

    this.app.use('/api', limiter)
  }

  private setGlobalMiddlewares(): void {
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))

    if (env.NODE_ENV === 'development') {
      logger.info('Running in development mode')
    }
  }

  private setRoutes(): void {
    this.app.use('/api/users', new userRoutes().getRouter())
    this.app.use('/api/hotels', new vendorRoutes().getRouter())
    this.app.use('/api/admin', new adminRoutes().getRouter())
  }

  private setErrorHandling(): void {
    //error handling setups
  }

  public listen(port: number): void {
    this.app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`)
    })
  }

  public getServer(): Application {
    return this.app
  }
}