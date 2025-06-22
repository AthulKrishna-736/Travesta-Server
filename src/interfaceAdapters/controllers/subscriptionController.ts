import { inject, injectable } from "tsyringe";
import { CustomRequest } from "../../utils/customRequest";
import { Response } from "express";
import { TOKENS } from "../../constants/token";
import { IBlockUnblockPlanUseCase, ICreatePlanUseCase, IGetActivePlansUseCase, IGetAllPlansUseCase, IUpdatePlanUseCase } from "../../domain/interfaces/model/subscription.interface";
import { TCreateSubscriptionDTO, TUpdateSubscriptionDTO } from "../dtos/subscription.dto";
import { ResponseHandler } from "../../middlewares/responseHandler";
import { HttpStatusCode } from "../../utils/HttpStatusCodes";


@injectable()
export class SubscriptionController {
    constructor(
        @inject(TOKENS.CreateSubscriptionUseCase) private _createSubscription: ICreatePlanUseCase,
        @inject(TOKENS.UpdateSubscriptionUseCase) private _updateSubscription: IUpdatePlanUseCase,
        @inject(TOKENS.BlockUnblockSubscriptionUseCase) private _blockUnblockSubscription: IBlockUnblockPlanUseCase,
        @inject(TOKENS.GetActiveSubscriptionsUseCase) private _getActiveSubscription: IGetActivePlansUseCase,
        @inject(TOKENS.GetAllSubscriptionsUseCase) private _getAllSubscriptions: IGetAllPlansUseCase,
    ) { }

    async createSubscriptionPlan(req: CustomRequest, res: Response): Promise<void> {
        try {
            const data: TCreateSubscriptionDTO = {
                name: req.body.name,
                description: req.body.description,
                type: req.body.type,
                price: req.body.price,
                duration: req.body.duration,
                features: req.body.features,
            }

            const { plan, message } = await this._createSubscription.createPlan(data);
            ResponseHandler.success(res, message, plan, HttpStatusCode.CREATED);
        } catch (error) {
            throw error;
        }
    }

    async updateSubscriptionPlan(req: CustomRequest, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const data: TUpdateSubscriptionDTO = {
                name: req.body.name,
                description: req.body.description,
                type: req.body.type,
                price: req.body.price,
                duration: req.body.duration,
                features: req.body.features,
            }

            const { plan, message } = await this._updateSubscription.updatePlan(id, data);
            ResponseHandler.success(res, message, plan, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }

    async blockUnblockSubscription(req: CustomRequest, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const { plan, message } = await this._blockUnblockSubscription.blockUnblockPlan(id);
            ResponseHandler.success(res, message, plan, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }

    async getActiveSubscriptions(req: CustomRequest, res: Response): Promise<void> {
        try {
            const { plans, message } = await this._getActiveSubscription.getActivePlans();
            ResponseHandler.success(res, message, plans, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }

    async getAllSubscriptions(req: CustomRequest, res: Response): Promise<void> {
        try {
            const { plans, message } = await this._getAllSubscriptions.getAllPlans();
            ResponseHandler.success(res, message, plans, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }
}



