import { inject, injectable } from "tsyringe";
import { ICreatePlanUseCase, TCreateSubscriptionData, TResponseSubscriptionData } from "../../../../domain/interfaces/model/subscription.interface";
import { TOKENS } from "../../../../constants/token";
import { ISubscriptionRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../utils/HttpStatusCodes";


@injectable()
export class CreatePlanUseCase implements ICreatePlanUseCase {
    constructor(
        @inject(TOKENS.SubscriptionRepository) private _subscriptionRepo: ISubscriptionRepository,
    ) { }

    async createPlan(data: TCreateSubscriptionData): Promise<{ plan: TResponseSubscriptionData; message: string; }> {
        const plan = await this._subscriptionRepo.createPlan(data);

        if (!plan) {
            throw new AppError('error while creating plan', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        return {
            plan,
            message: 'subscription plan created successfully'
        }
    }
}