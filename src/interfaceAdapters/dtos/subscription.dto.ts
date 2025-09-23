import { TSubscription } from "../../shared/types/client.types"

export type TCreateSubscriptionDTO = {
    name: string;
    description: string;
    type: TSubscription;
    price: number;
    duration: number;
    features: string[];
}

export type TUpdateSubscriptionDTO = {
    name?: string;
    description?: string;
    type?: TSubscription;
    price?: number;
    duration?: number;
    features?: string[];
}

export type TResponseSubscriptionDTO = {
    id: string;
    name: string;
    description: string;
    type: TSubscription;
    price: number;
    duration: number;
    features: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}