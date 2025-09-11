import { inject, injectable } from "tsyringe";
import { IUpdatePlanUseCase, TResponseSubscriptionData, TUpdateSubscriptionData } from "../../../../domain/interfaces/model/subscription.interface";
import { SubscriptionLookupBase } from "../../base/subscription.base";
import { TOKENS } from "../../../../constants/token";
import { ISubscriptionRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import mongoose from "mongoose";
import { PLAN_RES_MESSAGES } from "../../../../constants/resMessages";


@injectable()
export class UpdatePlanUseCase extends SubscriptionLookupBase implements IUpdatePlanUseCase {
    constructor(
        @inject(TOKENS.SubscriptionRepository) _subscriptionRepository: ISubscriptionRepository,
    ) {
        super(_subscriptionRepository);
    }

    async updatePlan(id: string, data: TUpdateSubscriptionData): Promise<{ plan: TResponseSubscriptionData; message: string; }> {
        try {
            const planEntity = await this.getSubscriptionByIdOrThrow(id);

            planEntity.updatePlan(data);

            const updatedPlan = await this._subscriptionRepository.updatePlan(planEntity.id, planEntity.getPersistablestate());

            if (!updatedPlan) {
                throw new AppError('Error while updating the plan', HttpStatusCode.INTERNAL_SERVER_ERROR);
            }

            return {
                plan: planEntity.toObject(),
                message: PLAN_RES_MESSAGES.update,
            };
        } catch (error: unknown) {
            if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
                throw new AppError(`Duplicate plan type: ${data.type} already exists`, HttpStatusCode.CONFLICT);
            }

            throw new AppError(error instanceof Error ? error.message : 'Unexpected error', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }
    }

}