import { TSubscription } from "../../../shared/types/client.types"
import { ISubscription, TCreateSubscriptionData, TUpdateSubscriptionData } from "../model/subscription.interface"

export interface ISubscriptionRepository {
    createPlan(data: TCreateSubscriptionData): Promise<ISubscription | null>
    updatePlan(planId: string, data: TUpdateSubscriptionData): Promise<ISubscription | null>
    findDuplicatePlan(planName: string): Promise<boolean>;
    findPlanById(planId: string): Promise<ISubscription | null>
    findPlanByType(type: TSubscription): Promise<ISubscription | null>
    findAllPlans(): Promise<ISubscription[] | null>
    findActivePlans(): Promise<ISubscription[] | null>
}