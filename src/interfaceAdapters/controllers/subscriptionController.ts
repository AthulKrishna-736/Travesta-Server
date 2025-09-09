import { inject, injectable } from "tsyringe";
import { CustomRequest } from "../../utils/customRequest";
import { Response } from "express";
import { TOKENS } from "../../constants/token";
import { IBlockUnblockPlanUseCase, ICreatePlanUseCase, IGetActivePlansUseCase, IGetAllPlansUseCase, IUpdatePlanUseCase } from "../../domain/interfaces/model/subscription.interface";
import { TCreateSubscriptionDTO, TUpdateSubscriptionDTO } from "../dtos/subscription.dto";
import { ResponseHandler } from "../../middlewares/responseHandler";
import { HttpStatusCode } from "../../constants/HttpStatusCodes";
import { ResponseMapper } from "../../utils/responseMapper";


@injectable()
export class SubscriptionController {
    constructor(
        @inject(TOKENS.CreateSubscriptionUseCase) private _createSubscriptionUseCase: ICreatePlanUseCase,
        @inject(TOKENS.UpdateSubscriptionUseCase) private _updateSubscriptionUseCase: IUpdatePlanUseCase,
        @inject(TOKENS.BlockUnblockSubscriptionUseCase) private _blockUnblockSubscriptionUseCase: IBlockUnblockPlanUseCase,
        @inject(TOKENS.GetActiveSubscriptionsUseCase) private _getActiveSubscriptionUseCase: IGetActivePlansUseCase,
        @inject(TOKENS.GetAllSubscriptionsUseCase) private _getAllSubscriptionsUseCase: IGetAllPlansUseCase,
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

            const { plan, message } = await this._createSubscriptionUseCase.createPlan(data);
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

            const { plan, message } = await this._updateSubscriptionUseCase.updatePlan(id, data);
            const mappedPlan = ResponseMapper.mapSubscriptionToResponseDTO(plan);
            ResponseHandler.success(res, message, mappedPlan, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }

    async blockUnblockSubscription(req: CustomRequest, res: Response): Promise<void> {
        try {
            const id = req.params.planId;
            const { plan, message } = await this._blockUnblockSubscriptionUseCase.blockUnblockPlan(id);
            const mappedPlan = ResponseMapper.mapSubscriptionToResponseDTO(plan);
            ResponseHandler.success(res, message, mappedPlan, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }

    async getActiveSubscriptions(req: CustomRequest, res: Response): Promise<void> {
        try {
            const { plans, message } = await this._getActiveSubscriptionUseCase.getActivePlans();
            const mappedPlans = plans.map(p => ResponseMapper.mapSubscriptionToResponseDTO(p));
            ResponseHandler.success(res, message, mappedPlans, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }

    async getAllSubscriptions(req: CustomRequest, res: Response): Promise<void> {
        try {
            const { plans, message } = await this._getAllSubscriptionsUseCase.getAllPlans();
            const mappedPlans = plans.map(p => ResponseMapper.mapSubscriptionToResponseDTO(p));
            ResponseHandler.success(res, message, mappedPlans, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }
}



