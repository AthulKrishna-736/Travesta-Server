import { ISubscriptionEntity, SubscriptionEntity } from "../../../domain/entities/admin/subscription.entity";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/subscriptionRepo.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";

interface ISubscriptionBase {
    getSubscriptionByIdOrThrow(id: string): Promise<ISubscriptionEntity>
    getAllSubscriptionOrThrow(): Promise<ISubscriptionEntity[]>
}

export abstract class SubscriptionLookupBase implements ISubscriptionBase {
    constructor(protected _subscriptionRepository: ISubscriptionRepository) { }

    async getSubscriptionByIdOrThrow(id: string): Promise<ISubscriptionEntity> {
        const plan = await this._subscriptionRepository.findPlanById(id);

        if (!plan) {
            throw new AppError('subscription plan not found', HttpStatusCode.NOT_FOUND);
        }

        return new SubscriptionEntity(plan);
    }

    async getAllSubscriptionOrThrow(): Promise<ISubscriptionEntity[]> {
        const plans = await this._subscriptionRepository.findAllPlans();

        if (!plans) {
            throw new AppError('No subscription plans found', HttpStatusCode.NOT_FOUND);
        }

        const mappedPlans = plans.map(p => new SubscriptionEntity(p))

        return mappedPlans;
    }
}