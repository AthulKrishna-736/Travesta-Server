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


export type TUserRegistrationInput = Pick<IUser, 'firstName' | 'lastName' | 'email' | 'password' | 'phone'> & { role?: TRole; subscriptionType?: TSubscription; };

export type TUpdateUserData = Partial<Omit<IUser, '_id' | 'email' | 'wishlist' | 'createdAt' | 'updatedAt' | 'isGoogle' | 'role' | 'subscriptionType'>>;

export type TResponseUserData = Omit<IUser, 'password'>;
