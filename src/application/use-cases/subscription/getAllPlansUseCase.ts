import { inject, injectable } from "tsyringe";
import { IGetAllPlansUseCase } from "../../../domain/interfaces/model/subscription.interface";
import { TOKENS } from "../../../constants/token";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/subscriptionRepo.interface";
import { PLAN_RES_MESSAGES } from "../../../constants/resMessages";
import { TResponseSubscriptionDTO } from "../../../interfaceAdapters/dtos/subscription.dto";
import { ResponseMapper } from "../../../utils/responseMapper";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";


@injectable()
export class GetAllPlansUseCase implements IGetAllPlansUseCase {
    constructor(
        @inject(TOKENS.SubscriptionRepository) private _subscriptionRepository: ISubscriptionRepository,
    ) { }

    async getAllPlans(): Promise<{ plans: TResponseSubscriptionDTO[]; message: string; }> {
        const plans = await this._subscriptionRepository.findAllPlans();
        if (!plans) {
            throw new AppError('No subscription plans found', HttpStatusCode.NOT_FOUND);
        }

        const mappedPlans = plans.map(p => ResponseMapper.mapSubscriptionToResponseDTO(p));

        return {
            plans: mappedPlans,
            message: PLAN_RES_MESSAGES.getAll,
        }
    }
}