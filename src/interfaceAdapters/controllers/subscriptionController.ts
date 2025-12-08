import { inject, injectable } from "tsyringe";
import { CustomRequest } from "../../utils/customRequest";
import { NextFunction, Response } from "express";
import { TOKENS } from "../../constants/token";
import { IBlockUnblockPlanUseCase, ICancelSubscriptionUseCase, ICreatePlanUseCase, IGetActivePlansUseCase, IGetAllPlanHistoryUseCase, IGetAllPlansUseCase, IGetUserActivePlanUseCase, IUpdatePlanUseCase } from "../../domain/interfaces/model/subscription.interface";
import { TCreateSubscriptionDTO, TUpdateSubscriptionDTO } from "../dtos/subscription.dto";
import { ResponseHandler } from "../../middlewares/responseHandler";
import { HttpStatusCode } from "../../constants/HttpStatusCodes";
import { Pagination } from "../../shared/types/common.types";
import { ISubscriptionController } from "../../domain/interfaces/controllers/subscriptionController.interface";
import { AppError } from "../../utils/appError";
import { AUTH_ERROR_MESSAGES } from "../../constants/errorMessages";


@injectable()
export class SubscriptionController implements ISubscriptionController {
    constructor(
        @inject(TOKENS.CreateSubscriptionUseCase) private _createSubscriptionUseCase: ICreatePlanUseCase,
        @inject(TOKENS.UpdateSubscriptionUseCase) private _updateSubscriptionUseCase: IUpdatePlanUseCase,
        @inject(TOKENS.BlockUnblockSubscriptionUseCase) private _blockUnblockSubscriptionUseCase: IBlockUnblockPlanUseCase,
        @inject(TOKENS.GetActiveSubscriptionsUseCase) private _getActiveSubscriptionUseCase: IGetActivePlansUseCase,
        @inject(TOKENS.GetAllSubscriptionsUseCase) private _getAllSubscriptionsUseCase: IGetAllPlansUseCase,
        @inject(TOKENS.GetAllPlanHistoryUseCase) private _getAllPlanHistoryUseCase: IGetAllPlanHistoryUseCase,
        @inject(TOKENS.GetUserActivePlanUseCase) private _getUserActivePlanUseCase: IGetUserActivePlanUseCase,
        @inject(TOKENS.CancelSubscriptionUseCase) private _cancelSubscriptionUseCase: ICancelSubscriptionUseCase,
    ) { }

    async createSubscriptionPlan(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {

            const { name, description, type, price, duration, features } = req.body;
            const data: TCreateSubscriptionDTO = {
                name,
                description,
                type,
                price,
                duration,
                features,
            }

            const { plan, message } = await this._createSubscriptionUseCase.createPlan(data);
            ResponseHandler.success(res, message, plan, HttpStatusCode.CREATED);
        } catch (error) {
            next(error);
        }
    }

    async updateSubscriptionPlan(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { planId } = req.params;
            const data: TUpdateSubscriptionDTO = req.body;

            const { plan, message } = await this._updateSubscriptionUseCase.updatePlan(planId, data);
            ResponseHandler.success(res, message, plan, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async blockUnblockSubscription(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { planId } = req.params;

            const { plan, message } = await this._blockUnblockSubscriptionUseCase.blockUnblockPlan(planId);
            ResponseHandler.success(res, message, plan, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async getActiveSubscriptions(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { plans, message } = await this._getActiveSubscriptionUseCase.getActivePlans();
            ResponseHandler.success(res, message, plans, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async getAllSubscriptions(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { plans, message } = await this._getAllSubscriptionsUseCase.getAllPlans();
            ResponseHandler.success(res, message, plans, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async getAllPlanHistory(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = Number(req.query.page);
            const limit = Number(req.query.limit);
            const type = req.query.type as string;

            const { histories, total, message } = await this._getAllPlanHistoryUseCase.getAllPlanHistory(page, limit, type);
            const meta: Pagination = { currentPage: page, pageSize: limit, totalData: total, totalPages: Math.floor(total / limit) }
            ResponseHandler.success(res, message, histories, HttpStatusCode.OK, meta);
        } catch (error) {
            next(error);
        }
    }

    async getUserActivePlan(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId
            if (!userId) {
                throw new AppError(AUTH_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);
            }

            const { plan, message } = await this._getUserActivePlanUseCase.getUserActivePlan(userId);
            ResponseHandler.success(res, message, plan, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async cancelUserSubscription(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId
            if (!userId) {
                throw new AppError(AUTH_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);
            }

            const { message } = await this._cancelSubscriptionUseCase.cancelSubscription(userId);
            ResponseHandler.success(res, message, null, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }
}



