import { inject, injectable } from "tsyringe";
import { CustomRequest } from "../../utils/customRequest";
import { NextFunction, Response } from "express";
import { TOKENS } from "../../constants/token";
import { IBlockUnblockPlanUseCase, ICreatePlanUseCase, IGetActivePlansUseCase, IGetAllPlansUseCase, IUpdatePlanUseCase } from "../../domain/interfaces/model/subscription.interface";
import { TCreateSubscriptionDTO, TUpdateSubscriptionDTO } from "../dtos/subscription.dto";
import { ResponseHandler } from "../../middlewares/responseHandler";
import { HttpStatusCode } from "../../constants/HttpStatusCodes";


@injectable()
export class SubscriptionController {
    constructor(
        @inject(TOKENS.CreateSubscriptionUseCase) private _createSubscriptionUseCase: ICreatePlanUseCase,
        @inject(TOKENS.UpdateSubscriptionUseCase) private _updateSubscriptionUseCase: IUpdatePlanUseCase,
        @inject(TOKENS.BlockUnblockSubscriptionUseCase) private _blockUnblockSubscriptionUseCase: IBlockUnblockPlanUseCase,
        @inject(TOKENS.GetActiveSubscriptionsUseCase) private _getActiveSubscriptionUseCase: IGetActivePlansUseCase,
        @inject(TOKENS.GetAllSubscriptionsUseCase) private _getAllSubscriptionsUseCase: IGetAllPlansUseCase,
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
}



