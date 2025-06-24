import { inject, injectable } from "tsyringe";
import { IGetActivePlansUseCase, TResponseSubscriptionData } from "../../../../domain/interfaces/model/subscription.interface";
import { TOKENS } from "../../../../constants/token";
import { ISubscriptionRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../utils/HttpStatusCodes";
import { SubscriptionEntity } from "../../../../domain/entities/admin/subscription.entity";


@injectable()
export class GetActivePlansUseCase implements IGetActivePlansUseCase {
    constructor(
        @inject(TOKENS.SubscriptionRepository) private _subscriptionRepo: ISubscriptionRepository,
    ) { }

    async getActivePlans(): Promise<{ plans: TResponseSubscriptionData[]; message: string; }> {
        const plans = await this._subscriptionRepo.findActivePlans();

        if (!plans) {
            throw new AppError('No active plans found', HttpStatusCode.NOT_FOUND);
        }

        const mappedPlans = plans.map(p => new SubscriptionEntity(p).toObject());

        return {
            plans: mappedPlans,
            message: 'Active plans fetched successfully',
        }
    }
}