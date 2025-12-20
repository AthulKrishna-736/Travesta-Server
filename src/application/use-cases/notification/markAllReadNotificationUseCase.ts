import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { INotificationRepository } from "../../../domain/interfaces/repositories/notificationRepo.interface";
import { IMarkAllNotificationsReadUseCase } from "../../../domain/interfaces/model/notification.interface";

@injectable()
export class MarkAllNotificationsReadUseCase implements IMarkAllNotificationsReadUseCase {

    constructor(
        @inject(TOKENS.NotificationRepository) private readonly _notificationRepository: INotificationRepository
    ) { }

    async markAllReadNotification(userId: string): Promise<{ message: string }> {
        await this._notificationRepository.markAllAsRead(userId);

        return { message: "All notifications marked as read" };
    }
}
