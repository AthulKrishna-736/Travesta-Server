import { injectable } from 'tsyringe';
import { BaseRepository } from './baseRepo';
import { walletModel, TWalletDocument } from '../models/walletModel';
import { IWalletRepository } from '../../../domain/interfaces/repositories/repository.interface';
import { IWallet, TCreateWalletData, TCreateWalletTransaction } from '../../../domain/interfaces/model/wallet.interface';
import mongoose from 'mongoose';

@injectable()
export class WalletRepository extends BaseRepository<TWalletDocument> implements IWalletRepository {
    constructor() {
        super(walletModel);
    }

    async createWallet(data: TCreateWalletData): Promise<IWallet | null> {
        const wallet = await this.create(data);
        return wallet.toObject<IWallet>();
    }

    async findWallet(userId: string): Promise<TWalletDocument | null> {
        const wallet = await this.model.findOne({ userId })
        return wallet;
    }

    async findUserWallet(userId: string, page: number, limit: number): Promise<{ wallet: IWallet | null, total: number }> {
        const wallet = await this.model.findOne({ userId }).lean<IWallet>().exec();

        if (!wallet) {
            return { wallet: null, total: 0 };
        }

        const total = wallet.transactions.length;
        const start = (page - 1) * limit;
        const end = start + limit;

        const paginatedTransactions = wallet.transactions
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(start, end);

        return {
            wallet: {
                _id: wallet._id,
                userId: wallet.userId,
                balance: wallet.balance,
                transactions: paginatedTransactions,
                createdAt: wallet.createdAt,
                updatedAt: wallet.updatedAt,
            },
            total
        };
    }


    async updateBalance(userId: string, newBalance: number): Promise<void> {
        await this.model.findOneAndUpdate({ userId }, { balance: newBalance }).exec();
    }

    async addTransaction(userId: string, transaction: TCreateWalletTransaction): Promise<boolean> {
        const wallet = await this.model.updateOne(
            { userId },
            {
                $push: { transactions: transaction },
                $inc: {
                    balance: transaction.type === 'credit' ? transaction.amount : -transaction.amount,
                },
            }
        ).exec();

        return wallet.matchedCount > 0 && wallet.modifiedCount > 0;
    }

    async findWalletExist(userId: string): Promise<boolean> {
        const wallet = await this.model.countDocuments({ userId }, { limit: 1 });
        return wallet ? true : false;
    }

    async transferAmountBetweenUsers(senderId: string, receiverId: string, amount: number, transactionId: string, relatedBookingId: string, description: string): Promise<boolean> {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const senderWallet = await this.model.findOne({ userId: senderId }).session(session);
            const receiverWallet = await this.model.findOne({ userId: receiverId }).session(session);

            if (!senderWallet || !receiverWallet) {
                throw new Error('Sender or receiver wallet not found');
            }

            if (senderWallet.balance < amount) {
                throw new Error('Insufficient balance')
            }

            senderWallet.balance -= amount;
            receiverWallet.balance += amount;

            const timestamp = new Date();

            senderWallet.transactions.push({
                type: 'debit',
                amount,
                transactionId,
                relatedBookingId,
                description,
                date: timestamp,
            });

            receiverWallet.transactions.push({
                type: 'credit',
                amount,
                transactionId,
                relatedBookingId,
                description,
                date: timestamp,
            });

            await senderWallet.save({ session });
            await receiverWallet.save({ session });

            await session.commitTransaction();
            session.endSession();
            return true;
        } catch (err) {
            console.log('err in transaction: ', err)
            await session.abortTransaction();
            session.endSession();
            return false;
        }
    }
}
