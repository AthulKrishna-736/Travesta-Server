import { NextFunction, Response } from "express";
import { CustomRequest } from "../../../utils/customRequest";

export interface INotificationController {
    createNotification(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
    getUserNotification(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
    getUnreadNotificationCount(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
    markAllNotification(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
    markNotification(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
}