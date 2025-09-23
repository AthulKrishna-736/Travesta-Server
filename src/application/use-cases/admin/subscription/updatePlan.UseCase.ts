import { inject, injectable } from "tsyringe";
import { IUpdatePlanUseCase } from "../../../../domain/interfaces/model/subscription.interface";
import { SubscriptionLookupBase } from "../../base/subscription.base";
import { TOKENS } from "../../../../constants/token";
import { ISubscriptionRepository } from "../../../../domain/interfaces/repositories/subscriptionRepo.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { PLAN_RES_MESSAGES } from "../../../../constants/resMessages";
import { SUBSCRIPTION_ERROR_MESSAGES } from "../../../../constants/errorMessages";
import { TResponseSubscriptionDTO, TUpdateSubscriptionDTO } from "../../../../interfaceAdapters/dtos/subscription.dto";
import { ResponseMapper } from "../../../../utils/responseMapper";


@injectable()
export class UpdatePlanUseCase extends SubscriptionLookupBase implements IUpdatePlanUseCase {
    constructor(
        @inject(TOKENS.SubscriptionRepository) _subscriptionRepository: ISubscriptionRepository,
    ) {
        super(_subscriptionRepository);
    }

    async updatePlan(id: string, data: TUpdateSubscriptionDTO): Promise<{ plan: TResponseSubscriptionDTO; message: string; }> {
        const planEntity = await this.getSubscriptionByIdOrThrow(id);

        planEntity.updatePlan(data);

        if (data.name && data.name.trim()) {
            const isDuplicate = await this._subscriptionRepository.findDuplicatePlan(data.name.trim());
            if (isDuplicate) {
                throw new AppError(SUBSCRIPTION_ERROR_MESSAGES.nameError, HttpStatusCode.CONFLICT);
            }
        }

        const updatedPlan = await this._subscriptionRepository.updatePlan(planEntity.id, planEntity.getPersistablestate());
        if (!updatedPlan) {
            throw new AppError(SUBSCRIPTION_ERROR_MESSAGES.updateFail, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const mappedPlan = ResponseMapper.mapSubscriptionToResponseDTO(updatedPlan)

        return {
            plan: mappedPlan,
            message: PLAN_RES_MESSAGES.update,
        };
    }

}