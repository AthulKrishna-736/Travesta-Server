import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import xss from 'xss-clean';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import logger from './utils/logger';
import { env } from './config/env';

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
    this.app.use(xss())
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
    //routes
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