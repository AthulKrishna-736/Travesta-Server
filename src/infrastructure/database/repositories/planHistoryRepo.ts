import { injectable } from 'tsyringe';
import { BaseRepository } from './baseRepo';
import { IUserSubscriptionHistory } from '../../../domain/interfaces/model/subscription.interface';
import { TUserSubscriptionHistoryDocument, userSubscriptionHistoryModel } from '../models/planHistoryModel';
import { ISubscriptionHistoryRepository } from '../../../domain/interfaces/repositories/subscriptionRepo.interface';
import { ClientSession } from 'mongoose';

@injectable()
export class SubscriptionHistoryRepository extends BaseRepository<TUserSubscriptionHistoryDocument> implements ISubscriptionHistoryRepository {
    constructor() {
        super(userSubscriptionHistoryModel);
    }

    async createHistory(data: Partial<IUserSubscriptionHistory>, session?: ClientSession): Promise<IUserSubscriptionHistory | null> {
        const [history] = await this.model.create([data], { session });
        return history.toObject();
    }

    async findByUserId(userId: string): Promise<IUserSubscriptionHistory[] | null> {
        const histories = await this.find({ userId }).exec();
        return histories.map(h => h.toObject());
    }

    async findBySubscriptionId(subscriptionId: string): Promise<IUserSubscriptionHistory[] | null> {
        const histories = await this.find({ subscriptionId }).exec();
        return histories.map(h => h.toObject());
    }

    async findActiveByUserId(userId: string): Promise<IUserSubscriptionHistory | null> {
        const history = await this.findOne({ userId, isActive: true }).exec();
        return history ? history.toObject() : null;
    }

    async deactivateActiveByUserId(userId: string, session?: ClientSession): Promise<void> {
        await this.model.updateMany(
            { userId, isActive: true },
            { $set: { isActive: false } },
            { session }
        );
    }

      async hasActiveSubscription(userId: string, session?: ClientSession): Promise<boolean> {
        const today = new Date();
        const activeSubscription = await this.model.findOne({
            userId,
            isActive: true,
            validFrom: { $lte: today },
            validUntil: { $gte: today },
        }, null, { session });

        return !!activeSubscription;
    }
}
