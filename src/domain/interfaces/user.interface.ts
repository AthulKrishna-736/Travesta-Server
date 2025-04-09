import { TRole, TSubcription } from "../../shared/types/user.types";

export interface IUser {
    _id?: string,
    firstName: string,
    lastName: string,
    googleId?: string,
    email: string,
    password: string,
    role: TRole,
    phone: number,
    subscriptionType: TSubcription,
    profileImage?: string,
    wishlist: string[],
    isKycVerified?: boolean,
    kycDocuments?: string[],
    createdAt: Date,
    updatedAt: Date
}