import { Socket, Server as SocketIOServer } from "socket.io";
import { container, injectable } from "tsyringe";
import { AppError } from "../../utils/appError";
import { HttpStatusCode } from "../../constants/HttpStatusCodes";
import * as cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { env } from "../config/env";
import logger from "../../utils/logger";
import { TOKENS } from "../../constants/token";
import { IMarkMsgAsReadUseCase, ISendMessageUseCase } from "../../domain/interfaces/model/chat.interface";
import { ISocketService } from "../../domain/interfaces/model/admin.interface";


@injectable()
export class SocketService implements ISocketService {
    constructor(private io: SocketIOServer) {
        this.registerMiddleware();
        this.trackEngineErrors();
        this.registerEvents();
    }

    get totalClients(): number {
        return this.io.engine.clientsCount;
    }

    private registerMiddleware() {
        this.io.use(async (socket: Socket, next) => {
            const cookieHeader = socket.handshake.headers.cookie;
            if (!cookieHeader) {
                return next(new AppError('Please authenticate to chat', HttpStatusCode.UNAUTHORIZED));
            }

            logger.info(`check cookie header: ${cookieHeader}`)

            const cookies = cookie.parse(cookieHeader);
            const accessToken = cookies['access_token'];

            try {
                const decode: any = jwt.verify(accessToken as string, env.JWT_ACCESS_SECRET);
                socket.data.user = decode;
                const userId = decode.userId;
                if (!userId) {
                    return next(new AppError('Invalid token payload', HttpStatusCode.UNAUTHORIZED));
                }
                next();
            } catch (error: any) {
                next(error);
            }
        })
    }

    private trackEngineErrors() {
        this.io.engine.on('connection_error', (err) => {
            logger.error(`error req: ${err.req}`);
            logger.error(`error code: ${err.code}`);
            logger.error(`error msg: ${err.message}`);
            logger.error(`error context: ${err.context}`);
        });
    }

    private registerEvents() {
        this.io.on("connection", async (socket: Socket) => {
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


            socket.on("read_message", async ({ senderId, receiverId, toRole }) => {
                try {
                    if (!senderId || !receiverId) {
                        throw new AppError('Missing sender or receiver id', HttpStatusCode.BAD_REQUEST);
                    }

                    const chatUseCase = container.resolve<IMarkMsgAsReadUseCase>(TOKENS.MarkMsgAsReadUseCase);
                    await chatUseCase.markMsgAsRead(senderId, receiverId);

                    logger.info(`conversation read by ${toRole}${receiverId}`);

                    const fromRoom = `${role}:${senderId}`;
                    const toRoom = `${toRole}:${receiverId}`;

                    this.io.to(fromRoom).emit("message_read", { withUserId: receiverId });
                    this.io.to(toRoom).emit("message_read", { withUserId: senderId });
                } catch (err) {
                    logger.error(`❌ Failed to mark conversation as read: ${err}`);
                }
            });

            socket.on("disconnect", () => {
                logger.info(`❌ Disconnected: ${role}:${userId}`);
            });
        });
    }
}