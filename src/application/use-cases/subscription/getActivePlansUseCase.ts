import { inject, injectable } from "tsyringe";
import { IGetActivePlansUseCase } from "../../../domain/interfaces/model/subscription.interface";
import { TOKENS } from "../../../constants/token";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/subscriptionRepo.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { PLAN_RES_MESSAGES } from "../../../constants/resMessages";
import { SUBSCRIPTION_ERROR_MESSAGES } from "../../../constants/errorMessages";
import { TResponseSubscriptionDTO } from "../../../interfaceAdapters/dtos/subscription.dto";
import { ResponseMapper } from "../../../utils/responseMapper";


@injectable()
export class GetActivePlansUseCase implements IGetActivePlansUseCase {
    constructor(
        @inject(TOKENS.SubscriptionRepository) private _subscriptionRepository: ISubscriptionRepository,
    ) { }

    async getActivePlans(): Promise<{ plans: TResponseSubscriptionDTO[]; message: string; }> {
        const plans = await this._subscriptionRepository.findActivePlans();

        if (!plans) {
            throw new AppError(SUBSCRIPTION_ERROR_MESSAGES.noPlans, HttpStatusCode.NOT_FOUND);
        }

        const mappedPlans = plans.map(p => ResponseMapper.mapSubscriptionToResponseDTO(p));

        return {
            plans: mappedPlans,
            message: PLAN_RES_MESSAGES.active,
        }
    }
}