import { Types } from "mongoose"
import { TCreateSubscriptionDTO, TResponseSubscriptionDTO, TUpdateSubscriptionDTO } from "../../../interfaceAdapters/dtos/subscription.dto"
import { TSubscription } from "../../../shared/types/client.types"
import { IUser } from "./user.interface"

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

//subscription history
export interface IUserSubscriptionHistory {
    userId: Types.ObjectId | string;
    subscriptionId: string | ISubscription;
    subscribedAt: Date;
    validFrom: Date;
    validUntil: Date;
    isActive: boolean;
    paymentAmount: number;
    createdAt?: Date;
    updatedAt?: Date;
}

//subscription types
export type TCreateSubscriptionData = Omit<ISubscription, '_id' | 'createdAt' | 'updatedAt' | 'isActive'>;
export type TUpdateSubscriptionData = Partial<Omit<ISubscription, '_id' | 'createdAt' | 'updatedAt' | 'isActive'>>;
export type TResponseSubscriptionData = ISubscription;


//subscription use cases
export interface ICreatePlanUseCase {
    createPlan(data: TCreateSubscriptionDTO): Promise<{ plan: TResponseSubscriptionDTO, message: string }>
}

export interface IUpdatePlanUseCase {
    updatePlan(id: string, data: TUpdateSubscriptionDTO): Promise<{ plan: TResponseSubscriptionDTO, message: string }>
}

export interface IGetActivePlansUseCase {
    getActivePlans(): Promise<{ plans: TResponseSubscriptionDTO[], message: string }>
}

export interface IBlockUnblockPlanUseCase {
    blockUnblockPlan(id: string): Promise<{ plan: TResponseSubscriptionDTO, message: string }>
}

export interface IGetAllPlansUseCase {
    getAllPlans(): Promise<{ plans: TResponseSubscriptionDTO[], message: string }>
}

export interface ISubscribePlanUseCase {
    subscribePlan(userId: string, planId: string): Promise<{ user: IUser, message: string }>
}

export interface IUserSubscribePlanUseCase {
    subscribePlan(userId: string, planId: string, paymentAmount: number): Promise<{ user: any, message: string }>
}


