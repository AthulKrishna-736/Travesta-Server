import { IUserSubscription } from "../../domain/interfaces/model/subscription.interface"
import { TRole, TSubscription } from "../../shared/types/client.types"

export interface CreateUserDTO {
    firstName: string
    lastName: string
    email: string
    password: string
    phone: number
    role?: TRole
}

export interface UpdateUserDTO {
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

}

export interface ResponseUserDTO {
    id?: string
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
    subscription: IUserSubscription | null
    createdAt: Date
    updatedAt: Date
}