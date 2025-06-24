import { inject, injectable } from "tsyringe";
import { ISubscribePlanUseCase } from "../../../domain/interfaces/model/subscription.interface";
import { UserLookupBase } from "../base/userLookup.base";
import { TOKENS } from "../../../constants/token";
import { ISubscriptionRepository, IUserRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { IUser } from "../../../domain/interfaces/model/user.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { SubscriptionEntity } from "../../../domain/entities/admin/subscription.entity";


@injectable()
export class SubscribePlanUseCase extends UserLookupBase implements ISubscribePlanUseCase {
    constructor(
        @inject(TOKENS.UserRepository) userRepo: IUserRepository,
        @inject(TOKENS.SubscriptionRepository) private _subscriptionRepo: ISubscriptionRepository,
    ) {
        super(userRepo);
    }

    async subscribePlan(userId: string, planId: string): Promise<{ user: IUser, message: string; }> {
        const userEntity = await this.getUserEntityOrThrow(userId);

        if (!planId) {
            throw new AppError('Cant subscribe. Plan id not found', HttpStatusCode.BAD_REQUEST);
        }

        const subscription = await this._subscriptionRepo.findPlanById(planId);

        if (!subscription) {
            throw new AppError('Subscription not found', HttpStatusCode.NOT_FOUND);
        }

        const subscriptionEntity = new SubscriptionEntity(subscription);

        if (!subscriptionEntity.isActive) {
            throw new AppError('Cant subscribe. Plan is not active', HttpStatusCode.CONFLICT);
        }

        const validFrom = new Date();
        const validUntil = new Date(validFrom);
        validUntil.setDate(validFrom.getDate() + subscriptionEntity.duration);

        userEntity.subscribe(planId, validFrom, validUntil);

        const subscribeUser = await this._userRepo.subscribeUser(userEntity.id as string, userEntity.getUpdatedSubscription());

        if (!subscribeUser) {
            throw new AppError('Failed to subscribe plan', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        return {
            user: subscribeUser,
            message: `User have successfully purchased ${subscription.name} plan`
        }
    }
}