import { TCreateSubscriptionData, ISubscription, TUpdateSubscriptionData } from "../../../domain/interfaces/model/subscription.interface";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/subscriptionRepo.interface";
import { TSubscription } from "../../../shared/types/client.types";
import { subscriptionModel, TSubscriptionDocument } from "../models/subscriptionModel";
import { BaseRepository } from "./baseRepo";


export class SusbcriptionRepository extends BaseRepository<TSubscriptionDocument> implements ISubscriptionRepository {
    constructor() {
        super(subscriptionModel)
    }

    async createPlan(data: TCreateSubscriptionData): Promise<ISubscription | null> {
        const plan = await this.create(data);
        return plan.toObject();
    }

    async updatePlan(planId: string, data: TUpdateSubscriptionData): Promise<ISubscription | null> {
        const plan = await this.update(planId, data);
        return plan?.toObject();
    }

    async findPlanById(planId: string): Promise<ISubscription | null> {
        const plan = await this.findById(planId)
        return plan?.toObject();
    }

    async findPlanByType(type: TSubscription): Promise<ISubscription | null> {
        const plan = await this.model.findOne({ type: type });
        return plan ? plan.toObject() : null;
    }

    async findAllPlans(): Promise<ISubscription[] | null> {
        const plans = await this.model.find();
        const mappedPlans = plans.map(p => p.toObject());
        return mappedPlans;
    }

    async findActivePlans(): Promise<ISubscription[] | null> {
        const plans = await this.find({ isActive: true });
        const mappedPlans = plans.map(p => p.toObject());
        return mappedPlans;
    }

    async findDuplicatePlan(planName: string): Promise<boolean> {
        const plans = await this.model.countDocuments({ name: { $regex: `^${planName}$`, $options: 'i' } }).exec();
        return plans > 0 ? true : false;
    }

    async changePlanStatus(amenityId: string, status: boolean): Promise<ISubscription | null> {
        const plan = await this.update(amenityId, { isActive: status });
        return plan;
    }
}
