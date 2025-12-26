import { container } from "tsyringe"
import { TOKENS } from "../../../constants/token"

import { CreateNotificationUseCase } from "../../../application/use-cases/notification/createNotificationUseCase";
import { GetUserNotificationsUseCase } from "../../../application/use-cases/notification/getUserNotificationUseCase";
import { GetUnreadNotificationCountUseCase } from "../../../application/use-cases/notification/getUnreadNotificationUseCase";
import { MarkAllNotificationsReadUseCase } from "../../../application/use-cases/notification/markAllReadNotificationUseCase";
import { MarkNotificationReadUseCase } from "../../../application/use-cases/notification/markReadNotificationUseCase";

import {
    ICreateNotificationUseCase,
    IGetUnreadNotificationCountUseCase,
    IGetUserNotificationsUseCase,
    IMarkAllNotificationsReadUseCase,
    IMarkNotificationReadUseCase
} from "../../../domain/interfaces/model/notification.interface";


container.register<ICreateNotificationUseCase>(TOKENS.CreateNotificationUseCase, {
    useClass: CreateNotificationUseCase,
})

container.register<IGetUserNotificationsUseCase>(TOKENS.GetUserNotificationsUseCase, {
    useClass: GetUserNotificationsUseCase,
})

container.register<IGetUnreadNotificationCountUseCase>(TOKENS.GetUnreadNotificationCountUseCase, {
    useClass: GetUnreadNotificationCountUseCase,
})

container.register<IMarkAllNotificationsReadUseCase>(TOKENS.MarkAllNotificationsReadUseCase, {
    useClass: MarkAllNotificationsReadUseCase,
})

container.register<IMarkNotificationReadUseCase>(TOKENS.MarkNotificationReadUseCase, {
    useClass: MarkNotificationReadUseCase,
})