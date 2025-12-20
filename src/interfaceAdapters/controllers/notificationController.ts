import { inject, injectable } from "tsyringe";
import { INotificationController } from "../../domain/interfaces/controllers/notificationController.interface";
import { TOKENS } from "../../constants/token";
import { ICreateNotificationUseCase, IGetUnreadNotificationCountUseCase, IGetUserNotificationsUseCase, IMarkAllNotificationsReadUseCase, IMarkNotificationReadUseCase } from "../../domain/interfaces/model/notification.interface";
import { Response, NextFunction } from "express";
import { CustomRequest } from "../../utils/customRequest";
import { AppError } from "../../utils/appError";
import { AUTH_ERROR_MESSAGES } from "../../constants/errorMessages";
import { HttpStatusCode } from "../../constants/HttpStatusCodes";
import { TCreateNotificationDTO } from "../dtos/notification.dto";
import { ResponseHandler } from "../../middlewares/responseHandler";

@injectable()
export class NotificationController implements INotificationController {
    constructor(
        @inject(TOKENS.CreateNotificationUseCase) private _createNotificationUseCase: ICreateNotificationUseCase,
        @inject(TOKENS.GetUserNotificationsUseCase) private _getUserNotificationUseCase: IGetUserNotificationsUseCase,
        @inject(TOKENS.GetUnreadNotificationCountUseCase) private _gertUnreadNotificationUseCase: IGetUnreadNotificationCountUseCase,
        @inject(TOKENS.MarkAllNotificationsReadUseCase) private _markAllNotificationUseCase: IMarkAllNotificationsReadUseCase,
        @inject(TOKENS.MarkNotificationReadUseCase) private _markNotificationUseCase: IMarkNotificationReadUseCase,
    ) { }

    async createNotification(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId
            if (!userId) throw new AppError(AUTH_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);

            const createNotification: TCreateNotificationDTO = {
                userId: userId,
                title: req.body.title,
                message: req.body.message,
            }
            const { notification, message } = await this._createNotificationUseCase.createNotification(createNotification);
            ResponseHandler.success(res, message, notification, HttpStatusCode.OK)
        } catch (error) {
            next(error)
        }
    }

    async getUserNotification(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId
            if (!userId) throw new AppError(AUTH_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);

            const { message, notifications } = await this._getUserNotificationUseCase.getUserNotifications(userId);
            ResponseHandler.success(res, message, notifications, HttpStatusCode.OK);
        } catch (error) {
            next(error)
        }
    }

    async getUnreadNotificationCount(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId
            if (!userId) throw new AppError(AUTH_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);

            const { unreadCount } = await this._gertUnreadNotificationUseCase.getUnreadNotification(userId);
            ResponseHandler.success(res, 'Fetched UnreadCount', unreadCount, HttpStatusCode.OK);
        } catch (error) {
            next(error)
        }
    }

    async markAllNotification(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId
            if (!userId) throw new AppError(AUTH_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);

            const { message } = await this._markAllNotificationUseCase.markAllReadNotification(userId);
            ResponseHandler.success(res, message, null, HttpStatusCode.OK);
        } catch (error) {
            next(error)
        }
    }

    async markNotification(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { notificationId } = req.params;
            if (!notificationId) throw new AppError('Notification id missing', HttpStatusCode.BAD_REQUEST);

            const { message } = await this._markNotificationUseCase.markReadNotification(notificationId);
            ResponseHandler.success(res, message, null, HttpStatusCode.OK);
        } catch (error) {
            next(error)
        }
    }
}