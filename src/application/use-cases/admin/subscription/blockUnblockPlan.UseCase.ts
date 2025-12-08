import { inject, injectable } from "tsyringe";
import { IBlockUnblockPlanUseCase } from "../../../../domain/interfaces/model/subscription.interface";
import { TOKENS } from "../../../../constants/token";
import { ISubscriptionRepository } from "../../../../domain/interfaces/repositories/subscriptionRepo.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { PLAN_RES_MESSAGES } from "../../../../constants/resMessages";
import { SUBSCRIPTION_ERROR_MESSAGES } from "../../../../constants/errorMessages";
import { TResponseSubscriptionDTO } from "../../../../interfaceAdapters/dtos/subscription.dto";
import { ResponseMapper } from "../../../../utils/responseMapper";


@injectable()
export class BlockUnblockPlanUseCase implements IBlockUnblockPlanUseCase {
    constructor(
        @inject(TOKENS.SubscriptionRepository) private _subscriptionRepository: ISubscriptionRepository,
    ) { }

    async blockUnblockPlan(id: string): Promise<{ plan: TResponseSubscriptionDTO; message: string; }> {
        const plan = await this._subscriptionRepository.findPlanById(id);
        if (!plan) {
            throw new AppError('subscription plan not found', HttpStatusCode.NOT_FOUND);
        }


        let updatedData;

        if (plan.isActive) {
            updatedData = await this._subscriptionRepository.changePlanStatus(plan._id as string, !plan.isActive);
        } else {
            updatedData = await this._subscriptionRepository.changePlanStatus(plan._id as string, !plan.isActive);
        }

        if (!updatedData) {
            throw new AppError(SUBSCRIPTION_ERROR_MESSAGES.blockError, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const mappedPlan = ResponseMapper.mapSubscriptionToResponseDTO(updatedData);

        return {
            plan: mappedPlan,
            message: `Subscription plan ${updatedData.isActive ? PLAN_RES_MESSAGES.unblock : PLAN_RES_MESSAGES.block}`,
        }
    }
}