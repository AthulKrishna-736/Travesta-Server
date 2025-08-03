import { Types } from "mongoose";

//wallet model
export interface IWalletTransaction {
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    relatedBookingId?: Types.ObjectId | string;
    date: Date;
}

export interface IWallet {
    _id?: string;
    userId: Types.ObjectId | string;
    balance: number;
    transactions: IWalletTransaction[];
    createdAt: Date;
    updatedAt: Date;
}

//wallet types
export type TCreateWalletData = Omit<IWallet, '_id' | 'createdAt' | 'updatedAt' | 'transactions'>;
export type TCreateWalletTransaction = Omit<IWalletTransaction, 'date'>;
export type TUpdateWalletBalance = { userId: string, newBalance: number };
export type TResponseWalletData = IWallet;

//wallet use case
export interface ICreateWalletUseCase {
    execute(userId: string): Promise<IWallet>;
}

export interface IGetWalletUseCase {
    getUserWallet(userId: string, page?: number, limit?: number): Promise<{ wallet: IWallet | null, total: number }>;
}

export interface IAddWalletTransactionUseCase {
    execute(userId: string, transaction: IWalletTransaction): Promise<void>;
}

//stripe service
export interface IStripeService {
    createPaymentIntent(userId: string, amount: number): Promise<{ clientSecret: string }>;
}

