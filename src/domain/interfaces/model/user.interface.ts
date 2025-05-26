import { TRole, TSubscription } from "../../../shared/types/client.types";

export interface IUser {
    _id?: string,
    firstName: string,
    lastName: string,
    isGoogle: boolean,
    email: string,
    password: string,
    role: TRole,
    phone: number,
    isBlocked: boolean,
    subscriptionType: TSubscription,
    profileImage?: string,
    wishlist: string[],
    isVerified: boolean,
    verificationReason?: string,
    kycDocuments?: string[],
    createdAt: Date,
    updatedAt: Date
}

