import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { INotificationRepository } from "../../../domain/interfaces/repositories/notificationRepo.interface";
import { IGetUnreadNotificationCountUseCase } from "../../../domain/interfaces/model/notification.interface";

@injectable()
export class GetUnreadNotificationCountUseCase implements IGetUnreadNotificationCountUseCase {

    constructor(
        @inject(TOKENS.NotificationRepository) private readonly _notificationRepository: INotificationRepository
    ) { }

    async getUnreadNotification(userId: string): Promise<{ unreadCount: number }> {
        const unreadCount = await this._notificationRepository.getUnreadCount(userId);
        return { unreadCount };
    }
}
