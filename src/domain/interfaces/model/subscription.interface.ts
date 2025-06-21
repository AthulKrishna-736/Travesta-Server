import { TSubscription } from "../../../shared/types/client.types"

//subscription model
export interface ISubscription {
    _id: string
    name: string
    description: string
    type: TSubscription
    price: number
    duration: number
    features: string[]
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

export interface IUserSubscription {
    plan: ISubscription | string;
    validFrom: Date;
    validUntil: Date;
}

//subscription types
export type TCreateSubscriptionData = Omit<ISubscription, '_id' | 'createdAt' | 'updatedAt'>;
export type TUpdateSubscriptionData = Partial<Omit<ISubscription, '_id' | 'createdAt' | 'updatedAt' | 'isActive' | 'duration'>>;
export type TResponseSubscriptionData = ISubscription;


//subscription use cases
export interface ICreatePlanUseCase {
    createPlan(data: TCreateSubscriptionData): Promise<{ plan: TResponseSubscriptionData, message: string }>
}

export interface IUpdatePlanUseCase {
    updatePlan(id: string, data: TUpdateSubscriptionData): Promise<{ plan: TResponseSubscriptionData, message: string }>
}

export interface IGetActivePlansUseCase {
    getActivePlans(): Promise<{ plans: TResponseSubscriptionData[], message: string }>
}

export interface IBlockUnblockPlanUseCase {
    blockUnblockPlan(id: string): Promise<{ plan: TResponseSubscriptionData, message: string }>
}

export interface IGetAllPlansUseCase {
    getAllPlans(): Promise<{ plans: TResponseSubscriptionData[], message: string }>
}


