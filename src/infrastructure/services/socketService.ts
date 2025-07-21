import { Socket, Server as SocketIOServer } from "socket.io";
import { container, injectable } from "tsyringe";
import { AppError } from "../../utils/appError";
import { HttpStatusCode } from "../../utils/HttpStatusCodes";
import * as cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { env } from "../config/env";
import logger from "../../utils/logger";
import { TOKENS } from "../../constants/token";
import { IMarkMsgAsReadUseCase, ISendMessageUseCase } from "../../domain/interfaces/model/chat.interface";


@injectable()
export class SocketService {
    constructor(private io: SocketIOServer) {
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

            logger.info(`check cookie header: ${cookieHeader}`)

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

            const { userId, role } = user;
            const room = `${role}:${userId}`;
            socket.join(room);

            logger.info(`✅ Socket connected: ${socket.id} (User: ${role}:${userId})`);

            socket.on("send_message", async ({ toId, toRole, message }) => {
                const timestamp = new Date().toISOString();
                const payload = {
                    fromId: userId,
                    fromRole: role,
                    toId,
                    toRole,
                    message,
                    timestamp,
                };

                try {
                    const chatUseCase = container.resolve<ISendMessageUseCase>(TOKENS.SendMessageUseCase);
                    const newMsg = await chatUseCase.sendMessage(payload);
                    logger.info(`📤 [${role}:${userId}] → ${toRole}:${toId}: ${message}`);
                    this.io.to(`${toRole}:${toId}`).emit("receive_message", newMsg);
                } catch (err) {
                    logger.error(`❌ Failed to save message: ${err}`);
                }
            });

            socket.on("typing", ({ toId, toRole }) => {
                this.io.to(`${toRole}:${toId}`).emit("typing", {
                    fromId: userId,
                    fromRole: role,
                });
            });


            socket.on("read_message", async ({ messageId, toId, toRole }) => {
                try {
                    if (!messageId) {
                        throw new AppError('No msg id found', HttpStatusCode.BAD_REQUEST);
                    }

                    if (!toId || !toRole) {
                        throw new AppError('Missing recipient information (toId or toRole)', HttpStatusCode.BAD_REQUEST);
                    }

                    const chatUseCase = container.resolve<IMarkMsgAsReadUseCase>(TOKENS.MarkMsgAsReadUseCase);
                    await chatUseCase.markMsgAsRead(messageId);
                    logger.info(`message read by ${toRole}${toId}`)

                    const fromRoom = `${role}:${userId}`;
                    const toRoom = `${toRole}:${toId}`;

                    this.io.to(fromRoom).emit("message_read", {
                        messageId,
                        by: { userId, role }
                    });

                    this.io.to(toRoom).emit("message_read", {
                        messageId,
                        by: { userId, role }
                    });
                } catch (err) {
                    logger.error(`❌ Failed to mark message as read: ${err}`);
                }
            });

            socket.on("disconnect", () => {
                logger.info(`❌ Disconnected: ${role}:${userId}`);
            });
        });
    }
}