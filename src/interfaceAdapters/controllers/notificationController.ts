import { inject, injectable } from "tsyringe";
import { INotificationController } from "../../domain/interfaces/controllers/notificationController.interface";
import { TOKENS } from "../../constants/token";
import { ICreateNotificationUseCase, IGetUserNotificationsUseCase, IMarkAllNotificationsReadUseCase, IMarkNotificationReadUseCase } from "../../domain/interfaces/model/notification.interface";
import { Response, NextFunction } from "express";
import { CustomRequest } from "../../utils/customRequest";
import { AppError } from "../../utils/appError";
import { AUTH_ERROR_MESSAGES } from "../../constants/errorMessages";
import { HttpStatusCode } from "../../constants/HttpStatusCodes";
import { TCreateNotificationDTO } from "../dtos/notification.dto";
import { ResponseHandler } from "../../middlewares/responseHandler";
import { notificationClients } from "../../infrastructure/database/models/notificationModel";

@injectable()
export class NotificationController implements INotificationController {
    constructor(
        @inject(TOKENS.CreateNotificationUseCase) private _createNotificationUseCase: ICreateNotificationUseCase,
        @inject(TOKENS.GetUserNotificationsUseCase) private _getUserNotificationUseCase: IGetUserNotificationsUseCase,
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
            ResponseHandler.success(res, message, notification, HttpStatusCode.CREATED)
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

    async getLiveNotification(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) return;

            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            notificationClients.set(userId.toString(), res);

            const heartbeat = setInterval(() => { res.write(": ping\n\n"); }, 5000);

            req.on("close", () => {
                clearInterval(heartbeat);
                notificationClients.delete(userId.toString());
                res.end();
            });
        } catch (error) {
            next(error);
        }
    }

    async markAllNotification(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId
            if (!userId) throw new AppError(AUTH_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);

            const { message } = await this._markAllNotificationUseCase.markAllReadNotification(userId);
            ResponseHandler.success(res, message, null, HttpStatusCode.NO_CONTENT);
        } catch (error) {
            next(error)
        }
    }

    async markNotification(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { notificationId } = req.params;
            if (!notificationId) throw new AppError('Notification id missing', HttpStatusCode.BAD_REQUEST);

            const { message } = await this._markNotificationUseCase.markReadNotification(notificationId);
            ResponseHandler.success(res, message, null, HttpStatusCode.NO_CONTENT);
        } catch (error) {
            next(error)
        }
    }
}