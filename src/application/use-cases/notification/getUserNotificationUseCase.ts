import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { INotificationRepository } from "../../../domain/interfaces/repositories/notificationRepo.interface";
import { IGetUserNotificationsUseCase } from "../../../domain/interfaces/model/notification.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { TResponseNotificationDTO } from "../../../interfaceAdapters/dtos/notification.dto";
import { ResponseMapper } from "../../../utils/responseMapper";

@injectable()
export class GetUserNotificationsUseCase implements IGetUserNotificationsUseCase {

    constructor(
        @inject(TOKENS.NotificationRepository) private readonly _notificationRepository: INotificationRepository
    ) { }

    async getUserNotifications(userId: string): Promise<{ notifications: TResponseNotificationDTO[], message: string }> {
        const notifications = await this._notificationRepository.findUserNotifications(userId);
        if (!notifications || notifications.length === 0) {
            throw new AppError("Failed to create notification", HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const mappedNotification = notifications.map(ResponseMapper.mapNotificationResponseDTO);

        return { notifications: mappedNotification, message: 'Fetched User Notifications' };
    }
}
