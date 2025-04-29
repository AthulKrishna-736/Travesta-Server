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
