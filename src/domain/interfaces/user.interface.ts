import { CreateUserDTO, UpdateUserDTO } from "../../interfaces/dtos/user/user.dto";
import { TRole, TSubscription } from "../../shared/types/user.types";

export interface IUser {
    _id?: string,
    firstName: string,
    lastName: string,
    googleId?: string,
    email: string,
    password: string,
    role: TRole,
    phone: number,
    subscriptionType: TSubscription,
    profileImage?: string,
    wishlist: string[],
    isKycVerified?: boolean,
    kycDocuments?: string[],
    createdAt: Date,
    updatedAt: Date
}

export interface IUserRepository {
    findByEmail(email: string): Promise<IUser | null>
    createUser(data: CreateUserDTO): Promise<IUser>
    updateUser(id: string, updates: UpdateUserDTO): Promise<IUser>
    findById(id: string): Promise<IUser | null>
    deleteUser(id: string): Promise<boolean>
    updatePassword(id: string, password: string): Promise<boolean>
    verifyKyc(id: string): Promise<boolean>
}