import { ClientSession } from 'mongoose';
import { TNotificationDocument } from '../../../infrastructure/database/models/notificationModel';
import { INotification } from '../model/notification.interface';

export interface INotificationRepository {
    createNotification(data: Pick<INotification, 'userId' | 'message' | 'title'>, session?: ClientSession): Promise<TNotificationDocument | null>;
    findUserNotifications(userId: string): Promise<TNotificationDocument[] | null>;
    markAsRead(notificationId: string): Promise<TNotificationDocument | null>;
    markAllAsRead(userId: string): Promise<void>;
    getUnreadCount(userId: string): Promise<number>;
}
