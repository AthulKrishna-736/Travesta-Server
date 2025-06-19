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


export type TUpdateSubscription = Partial<Omit<ISubscription, '_id' | 'createdAt' | 'updatedAt'>>;