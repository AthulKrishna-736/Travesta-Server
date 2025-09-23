import { inject, injectable } from "tsyringe";
import { ISubscribePlanUseCase } from "../../../domain/interfaces/model/subscription.interface";
import { UserLookupBase } from "../base/userLookup.base";
import { TOKENS } from "../../../constants/token";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/subscriptionRepo.interface";
import { IUserRepository } from "../../../domain/interfaces/repositories/userRepo.interface";
import { IUser } from "../../../domain/interfaces/model/user.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { SubscriptionEntity } from "../../../domain/entities/admin/subscription.entity";
import { SUBSCRIPTION_ERROR_MESSAGES } from "../../../constants/errorMessages";


@injectable()
export class SubscribePlanUseCase extends UserLookupBase implements ISubscribePlanUseCase {
    constructor(
        @inject(TOKENS.UserRepository) _userRepository: IUserRepository,
        @inject(TOKENS.SubscriptionRepository) private _subscriptionRepo: ISubscriptionRepository,
    ) {
        super(_userRepository);
    }

    async subscribePlan(userId: string, planId: string): Promise<{ user: IUser, message: string; }> {
        const userEntity = await this.getUserEntityOrThrow(userId);

        if (!planId) {
            throw new AppError(SUBSCRIPTION_ERROR_MESSAGES.notFound, HttpStatusCode.BAD_REQUEST);
        }

        const subscription = await this._subscriptionRepo.findPlanById(planId);

        if (!subscription) {
            throw new AppError(SUBSCRIPTION_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        const subscriptionEntity = new SubscriptionEntity(subscription);

        if (!subscriptionEntity.isActive) {
            throw new AppError(SUBSCRIPTION_ERROR_MESSAGES.notActive, HttpStatusCode.CONFLICT);
        }

        const validFrom = new Date();
        const validUntil = new Date(validFrom);
        validUntil.setDate(validFrom.getDate() + subscriptionEntity.duration);

        userEntity.subscribe(planId, validFrom, validUntil);

        const subscribeUser = await this._userRepository.subscribeUser(userEntity.id as string, userEntity.getUpdatedSubscription());

        if (!subscribeUser) {
            throw new AppError(SUBSCRIPTION_ERROR_MESSAGES.createFail, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        return {
            user: subscribeUser,
            message: `User have successfully purchased ${subscription.name} plan`,
        }
    }
}