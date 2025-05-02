import { TRole, TSubscription } from "../../../shared/types/user.types"

export interface CreateUserDTO {
    firstName: string
    lastName: string
    email: string
    password: string
    phone: number
    role: TRole
    subscriptionType: TSubscription
}

export interface UpdateUserDTO {
    firstName?: string
    lastName?: string
    isGoogle?: boolean
    phone?: number
    isBlocked?: boolean
    profileImage?: string
    subscriptionType?: TSubscription

}

export interface ResponseUserDTO {
    id: string
    name: string
    email: string
    isGoogle: boolean
    phone: number
    isBlocked: boolean
    wishlist: string[]
    role: TRole
    subscriptionType: TSubscription
}