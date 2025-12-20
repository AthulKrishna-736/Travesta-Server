import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { INotificationRepository } from "../../../domain/interfaces/repositories/notificationRepo.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { ICreateNotificationUseCase } from "../../../domain/interfaces/model/notification.interface";
import { TCreateNotificationDTO, TResponseNotificationDTO } from "../../../interfaceAdapters/dtos/notification.dto";
import { ResponseMapper } from "../../../utils/responseMapper";
import { ClientSession } from "mongoose";

@injectable()
export class CreateNotificationUseCase implements ICreateNotificationUseCase {

    constructor(
        @inject(TOKENS.NotificationRepository) private readonly _notificationRepository: INotificationRepository
    ) { }

    async createNotification(data: TCreateNotificationDTO, session?: ClientSession): Promise<{ message: string, notification: TResponseNotificationDTO }> {
        const notification = await this._notificationRepository.createNotification(data);

        if (!notification) {
            throw new AppError("Failed to create notification", HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const mappedNotification = ResponseMapper.mapNotificationResponseDTO(notification);

        return { message: "Notification created successfully", notification: mappedNotification };
    }
}
