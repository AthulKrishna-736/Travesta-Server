import { ISubscriptionEntity, SubscriptionEntity } from "../../../domain/entities/admin/subscription.entity";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";


export abstract class SubscriptionLookupBase {
    constructor(protected _subscriptionRepo: ISubscriptionRepository) { }

    async getSubscriptionByIdOrThrow(id: string): Promise<ISubscriptionEntity> {
        const plan = await this._subscriptionRepo.findPlanById(id);

        if (!plan) {
            throw new AppError('subscription plan not found', HttpStatusCode.NOT_FOUND);
        }

        return new SubscriptionEntity(plan);
    }

    async getAllSubscriptionOrThrow(): Promise<ISubscriptionEntity[]> {
        const plans = await this._subscriptionRepo.findAllPlans();

        if (!plans) {
            throw new AppError('No subscription plans found', HttpStatusCode.NOT_FOUND);
        }

        const mappedPlans = plans.map(p => new SubscriptionEntity(p))

        return mappedPlans;
    }
}