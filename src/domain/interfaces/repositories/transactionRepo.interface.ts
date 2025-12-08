import { ClientSession } from "mongoose";
import { TCreateTransaction, TResponseTransactions } from "../model/wallet.interface";

export interface ITransactionRepository {
    findUserTransactions(walletId: string, page: number, limit: number): Promise<{ transactions: TResponseTransactions[], total: number }>;
    findUserBookingTransactions(walletId: string, bookingId: string): Promise<TResponseTransactions[] | null>
    findUserSubscriptionTransactions(walletId: string, subscriptionId: string): Promise<TResponseTransactions[] | null>
    createTransaction(data: TCreateTransaction, session?: ClientSession): Promise<TResponseTransactions | null>
    findTransactionById(transactionId: string): Promise<TResponseTransactions | null>
}