import { Socket, Server as SocketIOServer } from "socket.io";
import { injectable } from "tsyringe";
import { AppError } from "../../utils/appError";
import { HttpStatusCode } from "../../utils/HttpStatusCodes";
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { env } from "../config/env";


@injectable()
export class SocketService {
    constructor(
        private io: SocketIOServer,
    ) {
        this.registerMiddleware();
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

    async sendMessage() { }

    async receiveMessage() { }

    async readMessage() { }
}