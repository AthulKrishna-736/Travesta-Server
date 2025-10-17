import { NextFunction, Response } from "express"
import { CustomRequest } from "../../../utils/customRequest"

export interface ISubscriptionController {
    createSubscriptionPlan(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
    updateSubscriptionPlan(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
    blockUnblockSubscription(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
    getActiveSubscriptions(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
    getAllSubscriptions(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
    getAllPlanHistory(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
    getUserActivePlan(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
}