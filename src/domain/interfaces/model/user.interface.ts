import { Types } from "mongoose";
import { TRole } from "../../../shared/types/client.types";

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
    subscription: Types.ObjectId | string | null,
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
