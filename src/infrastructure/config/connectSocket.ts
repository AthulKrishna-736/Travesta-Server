import { Server, Socket } from 'socket.io';
import { TRole } from '../../shared/types/client.types';
import logger from '../../utils/logger';

interface SocketUser {
    id: string;
    role: TRole;
}

export function setupSocket(io: Server) {
    // io.use((socket, next) => {
    //     const {token} = socket.handshake.auth?;
    //     if (!token) return next(new Error('No token'));
    //     try {
    //         const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as SocketUser;
    //         socket.data.user = decoded;
    //         return next();
    //     } catch (err) {
    //         return next(new Error('Unauthorized'));
    //     }
    // });

    io.on('connection', (socket: Socket) => {
        const user = socket.data.user;
        if (!user) {
            logger.warn("⚠️ Socket connected without user data");
            return;
        }

        const { id, role } = user;
        const room = `${role}:${id}`;
        socket.join(room);

        logger.info(`✅ Socket connected: ${socket.id} (User: ${role}:${id})`);

        socket.on('send_message', ({ toId, toRole, message }) => {
            const from = { id, role };
            const payload = {
                from,
                message,
                timestamp: new Date().toISOString(),
            };
            logger.info(`📤 [${role}:${id}] → ${toRole}:${toId}: ${message}`);
            io.to(`${toRole}:${toId}`).emit('receive_message', payload);
        });

        socket.on('disconnect', () => {
            logger.info(`❌ Disconnected: ${role}:${id}`);
        });
    });

}
