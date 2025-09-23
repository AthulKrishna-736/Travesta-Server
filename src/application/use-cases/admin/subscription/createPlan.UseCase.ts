import { inject, injectable } from "tsyringe";
import { ICreatePlanUseCase } from "../../../../domain/interfaces/model/subscription.interface";
import { TOKENS } from "../../../../constants/token";
import { ISubscriptionRepository } from "../../../../domain/interfaces/repositories/subscriptionRepo.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { PLAN_RES_MESSAGES } from "../../../../constants/resMessages";
import { SUBSCRIPTION_ERROR_MESSAGES } from "../../../../constants/errorMessages";
import { TCreateSubscriptionDTO, TResponseSubscriptionDTO } from "../../../../interfaceAdapters/dtos/subscription.dto";
import { ResponseMapper } from "../../../../utils/responseMapper";


@injectable()
export class CreatePlanUseCase implements ICreatePlanUseCase {
    constructor(
        @inject(TOKENS.SubscriptionRepository) private _subscriptionRepo: ISubscriptionRepository,
    ) { }

    async createPlan(data: TCreateSubscriptionDTO): Promise<{ plan: TResponseSubscriptionDTO; message: string; }> {
        const isDuplicate = await this._subscriptionRepo.findDuplicatePlan(data.name.trim());

        if (isDuplicate) {
            throw new AppError(SUBSCRIPTION_ERROR_MESSAGES.nameError, HttpStatusCode.CONFLICT);
        }

        const plan = await this._subscriptionRepo.createPlan(data);
        if (!plan) {
            throw new AppError(SUBSCRIPTION_ERROR_MESSAGES.createFail, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const mappedPlan = ResponseMapper.mapSubscriptionToResponseDTO(plan);

        return {
            plan: mappedPlan,
            message: PLAN_RES_MESSAGES.create,
        };
    }
}