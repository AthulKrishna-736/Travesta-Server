import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { ISubscriptionHistoryRepository } from "../../../domain/interfaces/repositories/subscriptionRepo.interface";
import { IGetUserActivePlanUseCase, IUserSubscriptionHistory } from "../../../domain/interfaces/model/subscription.interface";


@injectable()
export class GetUserActivePlanUseCase implements IGetUserActivePlanUseCase {
    constructor(
        @inject(TOKENS.SubscriptionHistoryRepository) private _planHistoryRepository: ISubscriptionHistoryRepository,
    ) { }

    async getUserActivePlan(userId: string): Promise<{ plan: IUserSubscriptionHistory | null, message: string }> {
        const plan = await this._planHistoryRepository.hasActiveSubscription(userId);
        if (!plan) {
            return {
                plan: null,
                message: 'User has no active plan',
            };
        }

        return {
            plan,
            message: 'Fetched user active plan',
        }
    }
}