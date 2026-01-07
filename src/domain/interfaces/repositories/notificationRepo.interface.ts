import { ClientSession } from 'mongoose';
import { INotification } from '../model/notification.interface';

export interface INotificationRepository {
    createNotification(data: Pick<INotification, 'userId' | 'message' | 'title'>, session?: ClientSession): Promise<INotification | null>;
    findUserNotifications(userId: string): Promise<INotification[] | null>;
    markAsRead(notificationId: string): Promise<INotification | null>;
    markAllAsRead(userId: string): Promise<void>;
}
