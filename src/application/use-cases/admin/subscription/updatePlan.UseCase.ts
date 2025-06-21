import { inject, injectable } from "tsyringe";
import { IUpdatePlanUseCase, TResponseSubscriptionData, TUpdateSubscriptionData } from "../../../../domain/interfaces/model/subscription.interface";
import { SubscriptionLookupBase } from "../../base/subscription.base";
import { TOKENS } from "../../../../constants/token";
import { ISubscriptionRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../utils/HttpStatusCodes";


@injectable()
export class UpdatePlanUseCase extends SubscriptionLookupBase implements IUpdatePlanUseCase {
    constructor(
        @inject(TOKENS.SubscriptionRepository) subscritionRepo: ISubscriptionRepository,
    ) {
        super(subscritionRepo);
    }

    async updatePlan(id: string, data: TUpdateSubscriptionData): Promise<{ plan: TResponseSubscriptionData; message: string; }> {
        const planEntity = await this.getSubscriptionByIdOrThrow(id);

        planEntity.updatePlan(data);

        const updatedPlan = await this._subscriptionRepo.updatePlan(planEntity.id, planEntity.getPersistablestate());

        if (!updatedPlan) {
            throw new AppError('Error while updating the plan', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        return {
            plan: planEntity.toObject(),
            message: 'Subscription plan updated successfully',
        }
    }

}