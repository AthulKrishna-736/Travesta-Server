import { inject, injectable } from "tsyringe";
import { IUserSubscribePlanUseCase } from "../../../../domain/interfaces/model/subscription.interface";
import { TOKENS } from "../../../../constants/token";
import { IUserRepository } from "../../../../domain/interfaces/repositories/userRepo.interface";
import { ISubscriptionRepository } from "../../../../domain/interfaces/repositories/subscriptionRepo.interface";
import { ISubscriptionHistoryRepository } from "../../../../domain/interfaces/repositories/subscriptionRepo.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";

@injectable()
export class SubscribePlanUseCase implements IUserSubscribePlanUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.SubscriptionRepository) private _subscriptionRepository: ISubscriptionRepository,
        @inject(TOKENS.SubscriptionHistoryRepository) private _historyRepository: ISubscriptionHistoryRepository,
    ) { }

    async subscribePlan(userId: string, planId: string, paymentAmount: number): Promise<{ user: any, message: string }> {
        // 1️⃣ Fetch user
        const user = await this._userRepository.findUserById(userId);
        if (!user) {
            throw new AppError("User not found", HttpStatusCode.NOT_FOUND);
        }

        // 2️⃣ Fetch subscription plan
        const plan = await this._subscriptionRepository.findPlanById(planId);
        if (!plan || !plan.isActive) {
            throw new AppError("Subscription plan not found or inactive", HttpStatusCode.NOT_FOUND);
        }

        await this._historyRepository.deactivateActiveByUserId(userId);

        const validFrom = new Date();
        const validUntil = new Date();
        validUntil.setDate(validFrom.getDate() + plan.duration); 

        const updatedUser = await this._userRepository.subscribeUser(userId, {
            subscription: {
                plan: plan._id,
                validFrom,
                validUntil
            }
        });

        await this._historyRepository.createHistory({
            userId: user._id,
            subscriptionId: plan._id,
            subscribedAt: new Date(),
            validFrom,
            validUntil,
            isActive: true,
            paymentAmount
        });

        // 7️⃣ Return updated user
        return { user: updatedUser, message: "Subscription activated successfully" };
    }
}
