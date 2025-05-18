import { TRole, TSubscription } from "../../shared/types/client.types";

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

export interface ICreateUserData {
    firstName: string
    lastName: string
    email: string
    password: string
    phone: number
    role: TRole
    subscriptionType: TSubscription
    createdAt?: Date
    updatedAtd?: Date
}

export interface IUpdateUserData {
    firstName?: string
    lastName?: string
    password?: string
    isGoogle?: boolean
    phone?: number
    isBlocked?: boolean
    profileImage?: string
    isVerified?: boolean
    kycDocuments?: string[]
    verificationReason?: string
    subscriptionType?: TSubscription
}

export interface IResponseUserData {
    id: string
    firstName: string
    lastName: string
    email: string
    isGoogle: boolean
    phone: number
    isBlocked: boolean
    profileImage?: string
    wishlist: string[]
    role: TRole
    kycDocuments?: string[]
    verificationReason?: string
    subscriptionType: TSubscription
    createdAt: Date
    updatedAt: Date
}