import { injectable } from 'tsyringe';
import { BaseRepository } from './baseRepo';
import { walletModel, TWalletDocument } from '../models/walletModel';
import { IWalletRepository } from '../../../domain/interfaces/repositories/repository.interface';
import { IWallet, TCreateWalletData, TCreateWalletTransaction } from '../../../domain/interfaces/model/wallet.interface';

@injectable()
export class WalletRepository extends BaseRepository<TWalletDocument> implements IWalletRepository {
    constructor() {
        super(walletModel);
    }

    async createWallet(data: TCreateWalletData): Promise<IWallet | null> {
        const wallet = await this.create(data);
        return wallet.toObject<IWallet>();
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
}
