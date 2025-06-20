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


//subscription repository


