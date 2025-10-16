import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../../constants/token";
import { ISubscriptionHistoryRepository } from "../../../../domain/interfaces/repositories/subscriptionRepo.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { IGetAllPlanHistoryUseCase, IUserSubscriptionHistory } from "../../../../domain/interfaces/model/subscription.interface";

@injectable()
export class GetAllPlanHistoryUseCase implements IGetAllPlanHistoryUseCase {
    constructor(
        @inject(TOKENS.SubscriptionHistoryRepository) private _subscriptionHistoryRepository: ISubscriptionHistoryRepository,
    ) { }

    async getAllPlanHistory(page: number, limit: number, type?: string): Promise<{ histories: IUserSubscriptionHistory[]; total: number; message: string }> {
        const { history, total } = await this._subscriptionHistoryRepository.findAllPlanHistory(page, limit, type);

        if (!history || history.length === 0) {
            throw new AppError('No subscription history found', HttpStatusCode.NOT_FOUND);
        }

        return {
            histories: history,
            total,
            message: 'Fetched All plans history',
        };
    }
}
