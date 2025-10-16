import { ClientSession } from "mongoose";
import { TSubscription } from "../../../shared/types/client.types"
import { ISubscription, IUserSubscriptionHistory, TCreateSubscriptionData, TUpdateSubscriptionData } from "../model/subscription.interface"

export interface ISubscriptionRepository {
    createPlan(data: TCreateSubscriptionData): Promise<ISubscription | null>
    updatePlan(planId: string, data: TUpdateSubscriptionData): Promise<ISubscription | null>
    findDuplicatePlan(planName: string): Promise<boolean>;
    findPlanById(planId: string): Promise<ISubscription | null>;
    findPlanByType(type: TSubscription): Promise<ISubscription | null>;
    findAllPlans(): Promise<ISubscription[] | null>;
    findActivePlans(): Promise<ISubscription[] | null>;
    changePlanStatus(amenityId: string, status: boolean): Promise<ISubscription | null>;
}

export interface ISubscriptionHistoryRepository {
    createHistory(data: Partial<IUserSubscriptionHistory>, session?: ClientSession): Promise<IUserSubscriptionHistory | null>
    findByUserId(userId: string): Promise<IUserSubscriptionHistory[] | null>;
    findBySubscriptionId(subscriptionId: string): Promise<IUserSubscriptionHistory[] | null>;
    findActiveByUserId(userId: string): Promise<IUserSubscriptionHistory | null>;
    deactivateActiveByUserId(userId: string, session?: ClientSession): Promise<void>;
    hasActiveSubscription(userId: string, session?: ClientSession): Promise<boolean>;
    findAllPlanHistory(page: number, limit: number, type?: string): Promise<{ history: IUserSubscriptionHistory[]; total: number }>;
}
