import { ClientSession } from "mongoose";
import { TResponseNotificationDTO } from "../../../interfaceAdapters/dtos/notification.dto";

export interface INotificationService {
    createAndPushNotification(data: { userId: string, title: string, message: string }, session?: ClientSession): Promise<TResponseNotificationDTO | null>
}