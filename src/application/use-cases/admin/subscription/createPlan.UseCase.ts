import { inject, injectable } from "tsyringe";
import { ICreatePlanUseCase, TCreateSubscriptionData, TResponseSubscriptionData } from "../../../../domain/interfaces/model/subscription.interface";
import { TOKENS } from "../../../../constants/token";
import { ISubscriptionRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../utils/HttpStatusCodes";
import mongoose from "mongoose";


@injectable()
export class CreatePlanUseCase implements ICreatePlanUseCase {
    constructor(
        @inject(TOKENS.SubscriptionRepository) private _subscriptionRepo: ISubscriptionRepository,
    ) { }

    async createPlan(data: TCreateSubscriptionData): Promise<{ plan: TResponseSubscriptionData; message: string; }> {
        try {
            const plan = await this._subscriptionRepo.createPlan(data);

            if (!plan) {
                throw new AppError('Error while creating plan', HttpStatusCode.INTERNAL_SERVER_ERROR);
            }

            return {
                plan,
                message: 'Subscription plan created successfully'
            };
        } catch (error: unknown) {
            if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
                throw new AppError(`Duplicate plan type: ${data.type} already exists`, HttpStatusCode.CONFLICT);
            }

            throw new AppError(error instanceof Error ? error.message : 'Unexpected error', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }
    }
}