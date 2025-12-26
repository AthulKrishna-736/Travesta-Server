import { injectable } from 'tsyringe';
import { BaseRepository } from './baseRepo';
import { IUserSubscriptionHistory } from '../../../domain/interfaces/model/subscription.interface';
import { TUserSubscriptionHistoryDocument, userSubscriptionHistoryModel } from '../models/planHistoryModel';
import { ISubscriptionHistoryRepository } from '../../../domain/interfaces/repositories/subscriptionRepo.interface';
import { ClientSession, PipelineStage, QueryOptions } from 'mongoose';

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

        const pipeline: PipelineStage[] = [
            {
                $lookup: {
                    from: 'subscriptions',
                    let: { subId: '$subscriptionId', planType: type },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$subId'] },
                                        ...(type && type !== 'all' ? [{ $eq: ['$type', '$$planType'] }] : [])
                                    ]
                                }
                            }
                        },
                        {
                            $project: { _id: 1, name: 1, type: 1, price: 1, duration: 1 }
                        }
                    ],
                    as: 'subscription'
                }
            },

            { $unwind: '$subscription' },

            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    pipeline: [
                        {
                            $project: { _id: 1, firstName: 1, lastName: 1, email: 1 }
                        }
                    ],
                    as: 'user'
                }
            },

            { $unwind: '$user' },

            {
                $facet: {
                    data: [
                        { $sort: { subscribedAt: -1 } },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 1,
                                subscribedAt: 1,
                                validFrom: 1,
                                validUntil: 1,
                                isActive: 1,
                                paymentAmount: 1,
                                subscription: 1,
                                user: 1
                            }
                        }
                    ],
                    total: [{ $count: 'count' }]
                }
            },

            {
                $addFields: {
                    total: { $ifNull: [{ $arrayElemAt: ['$total.count', 0] }, 0] }
                }
            }
        ];

        const result = await this.model.aggregate(pipeline);

        return {
            history: result[0].data,
            total: result[0].total,
        };
    }
}
