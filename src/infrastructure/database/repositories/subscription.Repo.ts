import { TCreateSubscriptionData, ISubscription, TUpdateSubscriptionData } from "../../../domain/interfaces/model/subscription.interface";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/repository.interface";
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

    async updatePlan(id: string, data: TUpdateSubscriptionData): Promise<ISubscription | null> {
        const plan = await this.update(id, data);
        return plan?.toObject();
    }

    async findPlanById(id: string): Promise<ISubscription | null> {
        const plan = await this.findById(id)
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
}
