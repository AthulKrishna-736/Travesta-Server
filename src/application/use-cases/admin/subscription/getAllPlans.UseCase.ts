import { inject, injectable } from "tsyringe";
import { IGetAllPlansUseCase, TResponseSubscriptionData } from "../../../../domain/interfaces/model/subscription.interface";
import { TOKENS } from "../../../../constants/token";
import { ISubscriptionRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { SubscriptionLookupBase } from "../../base/subscription.base";


@injectable()
export class GetAllPlansUseCase extends SubscriptionLookupBase implements IGetAllPlansUseCase {
    constructor(
        @inject(TOKENS.SubscriptionRepository) subscriptionRepo: ISubscriptionRepository,
    ) {
        super(subscriptionRepo);
    }

    async getAllPlans(): Promise<{ plans: TResponseSubscriptionData[]; message: string; }> {
        const planEntities = await this.getAllSubscriptionOrThrow();

        const mappedPlans = planEntities.map(p => p.toObject());

        return {
            plans: mappedPlans,
            message: 'All plans fetched successfully',
        }
    }
}