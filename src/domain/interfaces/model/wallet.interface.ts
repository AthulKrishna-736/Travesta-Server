import { Types } from "mongoose";

//wallet model
export interface IWalletTransaction {
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    transactionId: string;
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
export type TResponseWalletData = IWallet;

//wallet use case
export interface ICreateWalletUseCase {
    createUserWallet(userId: string): Promise<{ wallet: TResponseWalletData, message: string }>;
}

export interface IGetWalletUseCase {
    getUserWallet(userId: string, page?: number, limit?: number): Promise<{ wallet: TResponseWalletData | null, total: number, message: string }>;
}

export interface IAddWalletTransactionUseCase {
    addWalletAmount(userId: string, transaction: TCreateWalletTransaction): Promise<{ message: string }>;
}

export interface IBookingTransactionUseCase {
    bookingTransaction(userId: string, transaction: Required<TCreateWalletTransaction>): Promise<void>;
}

export interface ITransferUsersAmountUseCase {
    transferUsersAmount(senderId: string, receiverId: string, amount: number, transactionId: string, relatedBookingId: string, description: string): Promise<void>;
}
