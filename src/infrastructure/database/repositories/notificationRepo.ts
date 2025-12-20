import { injectable } from 'tsyringe';
import { BaseRepository } from './baseRepo';
import { notificationModel, TNotificationDocument } from '../models/notificationModel';
import { INotificationRepository } from '../../../domain/interfaces/repositories/notificationRepo.interface';
import { INotification } from '../../../domain/interfaces/model/notification.interface';
import { ClientSession } from 'mongoose';

@injectable()
export class NotificationRepository extends BaseRepository<TNotificationDocument> implements INotificationRepository {

    constructor() {
        super(notificationModel);
    }

    async createNotification(data: Pick<INotification, 'title' | 'message' | 'userId'>, session?: ClientSession): Promise<TNotificationDocument | null> {
        const options = session ? { session } : undefined;
        const notification = await this.model.create([data], options);
        return notification[0] ?? null;
    }

    async findUserNotifications(userId: string): Promise<TNotificationDocument[]> {
        const result = await this.model
            .find({ userId })
            .sort({ createdAt: -1 })
            .lean();

        return result;
    }

    async markAsRead(notificationId: string): Promise<TNotificationDocument | null> {
        const result = await this.model.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true }
        )

        return result;
    }

    async markAllAsRead(userId: string): Promise<void> {
        await this.model.updateMany(
            { userId, isRead: false },
            { isRead: true }
        );
    }

    async getUnreadCount(userId: string): Promise<number> {
        const result = await this.model.countDocuments({
            userId,
            isRead: false
        });

        return result;
    }
}
