import { Types } from "mongoose";
import { TCreateBookingData } from "./booking.interface";
import { TResponseWalletDTO } from "../../../interfaceAdapters/dtos/wallet.dto";
import { TResponseTransactionDTO } from "../../../interfaceAdapters/dtos/transactions.dto";
import Stripe from "stripe";

export type TTransactionType = 'credit' | 'debit';
export type TRelatedType = 'Booking' | 'Subscription';

//transaction model
export interface ITransactions {
    _id?: string;
    walletId: Types.ObjectId;
    type: TTransactionType;
    amount: number;
    description: string;
    transactionId: string;
    relatedEntityId?: Types.ObjectId;
    relatedEntityType?: TRelatedType;
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
export type TCreateTransaction = Omit<ITransactions, '_id' | 'createdAt' | 'updatedAt'>;
export type TResponseTransactions = ITransactions;

//wallet use case
export interface ICreateWalletUseCase {
    createUserWallet(userId: string): Promise<{ wallet: TResponseWalletDTO, message: string }>;
}

export interface IGetWalletUseCase {
    getUserWallet(userId: string): Promise<{ wallet: TResponseWalletDTO | null, message: string }>;
}

//transaction usecase
export interface IPlansTransactionUseCase {
    walletTransaction(userId: string, planId: string, amount: number): Promise<{ transaction: TResponseTransactionDTO, message: string }>
}

export interface IBookingTransactionUseCase {
    bookingTransaction(vendorId: string, bookingData: TCreateBookingData, method: 'online' | 'wallet'): Promise<{ message: string }>
}

export interface IAddMoneyToWalletUseCase {
    addMoneyToWallet(userId: string, amount: number): Promise<{ transaction: TResponseTransactionDTO, message: string }>
}

export interface IGetTransactionsUseCase {
    getTransactions(userId: string, page: number, limit: number): Promise<{ transactions: TResponseTransactionDTO[], total: number, message: string }>
}

export interface IHandleStripeWebhookUseCase {
    execute(event: Stripe.Event): Promise<void>
}