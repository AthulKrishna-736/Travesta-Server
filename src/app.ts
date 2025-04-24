import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import cookieparser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import logger from './utils/logger';
import { env } from './config/env';
import { userRoutes } from './interfaces/routes/userRoutes';
import { vendorRoutes } from './interfaces/routes/vendorRoutes';
import { adminRoutes } from './interfaces/routes/adminRoutes';
import { errorHandler } from './middlewares/errorHandler';

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
    this.app.use(cookieparser())
    this.app.use(helmet())
    this.app.use(cors({
      origin: env.CLIENT_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
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
    this.app.use(errorHandler)
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