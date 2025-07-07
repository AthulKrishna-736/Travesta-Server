import { Socket, Server as SocketIOServer } from "socket.io";
import { injectable } from "tsyringe";
import { AppError } from "../../utils/appError";
import { HttpStatusCode } from "../../utils/HttpStatusCodes";
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { env } from "../config/env";
import logger from "../../utils/logger";


@injectable()
export class SocketService {
    constructor(
        private io: SocketIOServer,
    ) {
        this.registerMiddleware();
        this.trackEngineErrors();
        this.registerEvents();
    }

    get totalClients(): number {
        return this.io.engine.clientsCount;
    }

    private registerMiddleware() {
        this.io.use((socket: Socket, next) => {
            const cookieHeader = socket.handshake.headers.cookie;
            if (!cookieHeader) {
                return next(new AppError('Please authenticate to chat', HttpStatusCode.UNAUTHORIZED));
            }

            const cookies = cookie.parse(cookieHeader);
            const token = cookies['access_token'];

            if (!token) {
                return next(new AppError('Access token not found in cookie', HttpStatusCode.UNAUTHORIZED));
            }

            try {
                const decode = jwt.verify(token, env.JWT_ACCESS_SECRET);
                socket.data.user = decode;
                next();
            } catch (error) {
                return next(new AppError('Error while verify token', HttpStatusCode.UNAUTHORIZED));
            }
        })
    }

    private trackEngineErrors() {
        this.io.engine.on('connection_error', (err) => {
            logger.error(`error req: ${err.req}`);
            logger.error(`error code: ${err.code}`);
            logger.error(`error msg: ${err.message}`);
            logger.error(`error context: ${err.context}`);
        })
    }

    private registerEvents() {
        this.io.on("connection", (socket: Socket) => {
            const user = socket.data.user;
            if (!user) {
                logger.warn("⚠️ Socket connected without user data");
                return;
            }

            const { id, role } = user;
            const room = `${role}:${id}`;
            socket.join(room);

            logger.info(`✅ Socket connected: ${socket.id} (User: ${role}:${id})`);

            socket.on("send_message", ({ toId, toRole, message }) => {
                const payload = {
                    from: { id, role },
                    message,
                    timestamp: new Date().toISOString(),
                };

                logger.info(`📤 [${role}:${id}] → ${toRole}:${toId}: ${message}`);
                this.io.to(`${toRole}:${toId}`).emit("receive_message", payload);
            });

            socket.on("disconnect", () => {
                logger.info(`❌ Disconnected: ${role}:${id}`);
            });
        });
    }
}