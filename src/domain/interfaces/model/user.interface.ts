import { TRole } from "../../../shared/types/client.types";
import { IUserSubscription } from "./subscription.interface";

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
    subscription: IUserSubscription | null,
    profileImage?: string,
    isVerified: boolean,
    verificationReason?: string,
    kycDocuments?: string[],
    createdAt: Date,
    updatedAt: Date
}


export type TUserRegistrationInput = Pick<IUser, 'firstName' | 'lastName' | 'email' | 'password' | 'phone' | 'role'>;
export type TUpdateUserData = Partial<Omit<IUser, '_id' | 'email' | 'createdAt' | 'updatedAt' | 'isGoogle' | 'role' | 'subscription'>>;
export type TResponseUserData = Omit<IUser, ''>;
