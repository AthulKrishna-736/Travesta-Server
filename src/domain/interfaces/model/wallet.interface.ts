import { Types } from "mongoose";
import { TCreateBookingData } from "./booking.interface";

//transaction model
export interface ITransactions {
    _id?: string;
    walletId: Types.ObjectId;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    transactionId?: string;
    relatedEntityId?: Types.ObjectId;
    relatedEntityType?: 'Booking' | 'Subscription';
    createdAt: Date;
    updatedAt: Date;
}

//wallet model
export interface IWallet {
    _id?: string;
    userId: Types.ObjectId | string;
    balance: number;
    createdAt: Date;
    updatedAt: Date;
}

//wallet types
export type TCreateWalletData = Omit<IWallet, '_id' | 'createdAt' | 'updatedAt'>;
export type TResponseWalletData = IWallet;

//transaction types
export type TCreateTransaction = Omit<ITransactions, 'createdAt' | 'updatedAt'>;
export type TResponseTransactions = ITransactions;

//wallet use case
export interface ICreateWalletUseCase {
    createUserWallet(userId: string): Promise<{ wallet: TResponseWalletData, message: string }>;
}

export interface IGetWalletUseCase {
    getUserWallet(userId: string): Promise<{ wallet: TResponseWalletData | null, message: string }>;
}

//transaction usecase
export interface IPlansTransactionUseCase {
    walletTransaction(userId: string, planId: string, amount: number): Promise<{ transaction: TResponseTransactions, message: string }>
}

export interface IBookingTransactionUseCase {
    bookingTransaction(vendorId: string, bookingData: TCreateBookingData, method: 'online' | 'wallet'): Promise<{ transaction: TResponseTransactions, message: string }>
}

export interface IAddMoneyToWalletUseCase {
    addMoneyToWallet(userId: string, amount: number): Promise<{ transaction: TResponseTransactions, message: string }>
}

export interface IGetTransactionsUseCase {
    getTransactions(userId: string, page: number, limit: number): Promise<{ transactions: TResponseTransactions[], total: number, message: string }>
}