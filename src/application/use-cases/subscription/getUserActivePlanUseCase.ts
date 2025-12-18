import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { ISubscriptionHistoryRepository } from "../../../domain/interfaces/repositories/subscriptionRepo.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { IGetUserActivePlanUseCase, IUserSubscriptionHistory } from "../../../domain/interfaces/model/subscription.interface";


@injectable()
export class GetUserActivePlanUseCase implements IGetUserActivePlanUseCase {
    constructor(
        @inject(TOKENS.SubscriptionHistoryRepository) private _planHistoryRepository: ISubscriptionHistoryRepository,
    ) { }

    async getUserActivePlan(userId: string): Promise<{ plan: IUserSubscriptionHistory, message: string }> {
        const plan = await this._planHistoryRepository.hasActiveSubscription(userId);
        if (!plan) {
            throw new AppError('User have no active plans', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        return {
            plan,
            message: 'Fetched user active plan',
        }
    }
}