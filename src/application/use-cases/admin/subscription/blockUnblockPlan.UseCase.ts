import { inject, injectable } from "tsyringe";
import { SubscriptionLookupBase } from "../../base/subscription.base";
import { IBlockUnblockPlanUseCase, TResponseSubscriptionData } from "../../../../domain/interfaces/model/subscription.interface";
import { TOKENS } from "../../../../constants/token";
import { ISubscriptionRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../utils/HttpStatusCodes";
import { PLAN_RES_MESSAGES } from "../../../../constants/resMessages";


@injectable()
export class BlockUnblockPlanUseCase extends SubscriptionLookupBase implements IBlockUnblockPlanUseCase {
    constructor(
        @inject(TOKENS.SubscriptionRepository) subscriptionRepo: ISubscriptionRepository,
    ) {
        super(subscriptionRepo);
    }

    async blockUnblockPlan(id: string): Promise<{ plan: TResponseSubscriptionData; message: string; }> {
        const planEntity = await this.getSubscriptionByIdOrThrow(id);

        if (planEntity.isActive) {
            planEntity.block();
        } else {
            planEntity.unblock();
        }

        const updatedData = await this._subscriptionRepo.updatePlan(planEntity.id, planEntity.getPersistablestate());

        if (!updatedData) {
            throw new AppError('Error while block/unblock operation', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        return {
            plan: planEntity.toObject(),
            message: `Subscription plan ${planEntity.isActive ? PLAN_RES_MESSAGES.unblock : PLAN_RES_MESSAGES.block}`,
        }
    }
}