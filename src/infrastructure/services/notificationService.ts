import { inject, injectable } from "tsyringe";
import { notificationClients } from "../database/models/notificationModel";
import { TOKENS } from "../../constants/token";
import { INotificationRepository } from "../../domain/interfaces/repositories/notificationRepo.interface";
import { INotificationService } from "../../domain/interfaces/services/notificationService.interface";
import { TResponseNotificationDTO } from "../../interfaceAdapters/dtos/notification.dto";
import { ResponseMapper } from "../../utils/responseMapper";
import { ClientSession } from "mongoose";

@injectable()
export class NotificationService implements INotificationService {
    constructor(
        @inject(TOKENS.NotificationRepository) private _notificationRepository: INotificationRepository,
    ) { }

    async createAndPushNotification(data: { userId: string, title: string, message: string }, session?: ClientSession): Promise<TResponseNotificationDTO | null> {
        const notification = await this._notificationRepository.createNotification({
            userId: data.userId,
            title: data.title,
            message: data.message,
        }, session);

        if (!notification) return null;

        const mappedNotification = ResponseMapper.mapNotificationResponseDTO(notification)

        const client = notificationClients.get(data.userId.toString());

        if (client) {
            client.write(`event: notification\n` + `data: ${JSON.stringify(mappedNotification)}\n\n`);
        }

        return mappedNotification;
    }
}
