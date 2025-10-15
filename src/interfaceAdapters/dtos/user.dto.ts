import { IUserSubscription } from "../../domain/interfaces/model/subscription.interface"
import { TRole } from "../../shared/types/client.types"

export type TCreateUserDTO = {
    firstName: string
    lastName: string
    email: string
    password: string
    phone: number
    role: TRole
}

export type TUpdateUserDTO = {
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

export type TResponseUserDTO = {
    id: string
    firstName: string
    lastName: string
    isGoogle: boolean
    email: string
    role: TRole
    phone: number
    isBlocked: boolean
    subscription: IUserSubscription | null
    profileImage?: string
    isVerified: boolean
    verificationReason?: string
    kycDocuments?: string[]
    createdAt: Date
    updatedAt: Date
}