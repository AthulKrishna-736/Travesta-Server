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

    async hasActiveSubscription(userId: string, session?: ClientSession): Promise<IUserSubscriptionHistory | null> {
        const today = new Date();
        const activeSubscription = await this.model.findOne({
            userId,
            isActive: true,
            validFrom: { $lte: today },
            validUntil: { $gte: today },
        }, null, { session })
            .populate('subscriptionId', 'name description type price duration features');

        return activeSubscription;
    }

    async findAllPlanHistory(page: number, limit: number, type?: string): Promise<{ history: IUserSubscriptionHistory[]; total: number }> {
        const skip = (page - 1) * limit;
        const filter: any = {};

        if (type) {
            filter['subscription.type'] = type;
        }

        const pipeline: any[] = [
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $unwind: '$user',
            },
            {
                $lookup: {
                    from: 'subscriptions',
                    localField: 'subscriptionId',
                    foreignField: '_id',
                    as: 'subscription',
                },
            },
            {
                $unwind: '$subscription',
            },
            { $match: { 'subscription.type': type } }
        ];



        const totalPipeline = [...pipeline, { $count: 'total' }];
        const totalResult = await this.model.aggregate(totalPipeline);
        const total = totalResult[0]?.total || 0;

        pipeline.push(
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        );

        const histories = await this.model.aggregate(pipeline);

        return {
            history: histories,
            total,
        };
    }

}
