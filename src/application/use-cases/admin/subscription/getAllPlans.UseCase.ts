import { inject, injectable } from "tsyringe";
import { IGetAllPlansUseCase } from "../../../../domain/interfaces/model/subscription.interface";
import { TOKENS } from "../../../../constants/token";
import { ISubscriptionRepository } from "../../../../domain/interfaces/repositories/subscriptionRepo.interface";
import { SubscriptionLookupBase } from "../../base/subscription.base";
import { PLAN_RES_MESSAGES } from "../../../../constants/resMessages";
import { TResponseSubscriptionDTO } from "../../../../interfaceAdapters/dtos/subscription.dto";
import { ResponseMapper } from "../../../../utils/responseMapper";


@injectable()
export class GetAllPlansUseCase extends SubscriptionLookupBase implements IGetAllPlansUseCase {
    constructor(
        @inject(TOKENS.SubscriptionRepository) _subscriptionRepository: ISubscriptionRepository,
    ) {
        super(_subscriptionRepository);
    }

    async getAllPlans(): Promise<{ plans: TResponseSubscriptionDTO[]; message: string; }> {
        const planEntities = await this.getAllSubscriptionOrThrow();

        const mappedPlans = planEntities.map(p => ResponseMapper.mapSubscriptionToResponseDTO(p.toObject()));

        return {
            plans: mappedPlans,
            message: PLAN_RES_MESSAGES.getAll,
        }
    }
}