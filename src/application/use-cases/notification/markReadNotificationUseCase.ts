import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { INotificationRepository } from "../../../domain/interfaces/repositories/notificationRepo.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { IMarkNotificationReadUseCase } from "../../../domain/interfaces/model/notification.interface";

@injectable()
export class MarkNotificationReadUseCase implements IMarkNotificationReadUseCase {
    constructor(
        @inject(TOKENS.NotificationRepository) private readonly _notificationRepository: INotificationRepository
    ) { }

    async markReadNotification(notificationId: string): Promise<{ message: string }> {
        const updated = await this._notificationRepository.markAsRead(notificationId);
        if (!updated) {
            throw new AppError("Notification not found", HttpStatusCode.NOT_FOUND);
        }

        return { message: "Notification marked as read" };
    }
}
