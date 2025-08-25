import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepo";
import { transactionModel, TTransactionDoc } from "../models/transactionModel";
import { ITransactionRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { TCreateTransaction } from "../../../domain/interfaces/model/wallet.interface";


@injectable()
export class TransactionRepo extends BaseRepository<TTransactionDoc> implements ITransactionRepository {
    constructor() {
        super(transactionModel);
    }

    async findTransactionById(transactionId: string): Promise<TTransactionDoc | null> {
        const transaction = await this.model.findOne({ transactionId }).lean();
        return transaction;
    }

    async findUserBookingTransactions(walletId: string, bookingId: string): Promise<TTransactionDoc[] | null> {
        const transactions = await this.model.find({ walletId, relatedEntityId: bookingId }).lean();
        return transactions;
    }

    async findUserSubscriptionTransactions(walletId: string, subscriptionId: string): Promise<TTransactionDoc[] | null> {
        const transactions = await this.model.find({ walletId, relatedEntityId: subscriptionId }).lean();
        return transactions;
    }

    async createTransaction(data: TCreateTransaction): Promise<TTransactionDoc | null> {
        const transaction = await this.create(data);
        return transaction;
    }

    async findUserTransactions(walletId: string, page: number, limit: number): Promise<{ transactions: TTransactionDoc[]; total: number; }> {
        const skip = (page - 1) * limit;
        const totalTransactions = await this.model.countDocuments({ walletId });
        const transactions = await this.find({ walletId }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
        return {
            transactions,
            total: totalTransactions,
        }
    }
}