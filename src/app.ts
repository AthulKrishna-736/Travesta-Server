import express, { Application } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http'
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import cookieparser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import logger from './utils/logger';
import { env } from './infrastructure/config/env';
import { userRoutes } from './interfaceAdapters/routes/userRoutes';
import { vendorRoutes } from './interfaceAdapters/routes/vendorRoutes';
import { adminRoutes } from './interfaceAdapters/routes/adminRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { container } from 'tsyringe';
import { TOKENS } from './constants/token';

export class App {
  public app: Application;
  public server: http.Server;
  public io: SocketIOServer;

  constructor() {
    this.app = express()
    this.server = http.createServer(this.app);
    this.setSecurityMiddlewares()
    this.setGlobalMiddlewares()
    this.setRoutes()
    this.setErrorHandling()

    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: env.CLIENT_URL,
        credentials: true,
      },
      path: '/api/chat',
      transports: ['polling', 'websocket']
    });

    container.registerInstance(SocketIOServer, this.io)
    container.resolve(TOKENS.SocketService);
  }

  private setSecurityMiddlewares(): void {
    this.app.use(cookieparser())
    this.app.use(helmet())
    this.app.use(cors({
      origin: '*',
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
    this.app.use('/api/vendor', new vendorRoutes().getRouter())
    this.app.use('/api/admin', new adminRoutes().getRouter())
  }

  private setErrorHandling(): void {
    this.app.use(errorHandler)
  }

  public listen(port: number): void {
    this.server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`)
    })
  }

  public getServer(): Application {
    return this.app
  }
}