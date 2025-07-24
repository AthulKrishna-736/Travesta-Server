import { inject, injectable } from "tsyringe";
import { CustomRequest } from "../../utils/customRequest";
import { Response } from "express";
import { TOKENS } from "../../constants/token";
import { IBlockUnblockPlanUseCase, ICreatePlanUseCase, IGetActivePlansUseCase, IGetAllPlansUseCase, IUpdatePlanUseCase } from "../../domain/interfaces/model/subscription.interface";
import { TCreateSubscriptionDTO, TUpdateSubscriptionDTO } from "../dtos/subscription.dto";
import { ResponseHandler } from "../../middlewares/responseHandler";
import { HttpStatusCode } from "../../utils/HttpStatusCodes";
import { ResponseMapper } from "../../utils/responseMapper";


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
            const mappedPlan = ResponseMapper.mapSubscriptionToResponseDTO(plan);
            ResponseHandler.success(res, message, mappedPlan, HttpStatusCode.CREATED);
        } catch (error) {
            throw error;
        }
    }

    async updateSubscriptionPlan(req: CustomRequest, res: Response): Promise<void> {
        try {
            const id = req.params.planId;
            const data: TUpdateSubscriptionDTO = {
                name: req.body.name,
                description: req.body.description,
                type: req.body.type,
                price: req.body.price,
                duration: req.body.duration,
                features: req.body.features,
            }

            const { plan, message } = await this._updateSubscription.updatePlan(id, data);
            const mappedPlan = ResponseMapper.mapSubscriptionToResponseDTO(plan);
            ResponseHandler.success(res, message, mappedPlan, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }

    async blockUnblockSubscription(req: CustomRequest, res: Response): Promise<void> {
        try {
            const id = req.params.planId;
            const { plan, message } = await this._blockUnblockSubscription.blockUnblockPlan(id);
            const mappedPlan = ResponseMapper.mapSubscriptionToResponseDTO(plan);
            ResponseHandler.success(res, message, mappedPlan, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }

    async getActiveSubscriptions(req: CustomRequest, res: Response): Promise<void> {
        try {
            const { plans, message } = await this._getActiveSubscription.getActivePlans();
            const mappedPlans = plans.map(p => ResponseMapper.mapSubscriptionToResponseDTO(p));
            ResponseHandler.success(res, message, mappedPlans, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }

    async getAllSubscriptions(req: CustomRequest, res: Response): Promise<void> {
        try {
            const { plans, message } = await this._getAllSubscriptions.getAllPlans();
            const mappedPlans = plans.map(p => ResponseMapper.mapSubscriptionToResponseDTO(p));
            ResponseHandler.success(res, message, mappedPlans, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }
}



