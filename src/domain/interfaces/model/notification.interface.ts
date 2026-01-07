import { ClientSession, Types } from 'mongoose';
import { TCreateNotificationDTO, TResponseNotificationDTO } from '../../../interfaceAdapters/dtos/notification.dto';

export interface INotification {
    _id?: string;
    userId: Types.ObjectId | string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICreateNotificationUseCase {
    createNotification(data: TCreateNotificationDTO, session?: ClientSession): Promise<{ message: string, notification: TResponseNotificationDTO }>;
}

export interface IGetUserNotificationsUseCase {
    getUserNotifications(userId: string): Promise<{ message: string, notifications: TCreateNotificationDTO[] }>;
}

export interface IMarkNotificationReadUseCase {
    markReadNotification(notificationId: string): Promise<{ message: string }>;
}

export interface IMarkAllNotificationsReadUseCase {
    markAllReadNotification(userId: string): Promise<{ message: string }>;
}