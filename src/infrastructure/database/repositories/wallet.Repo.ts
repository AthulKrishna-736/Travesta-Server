import { injectable } from 'tsyringe';
import { BaseRepository } from './baseRepo';
import { walletModel, TWalletDocument } from '../models/walletModel';
import { IWalletRepository } from '../../../domain/interfaces/repositories/repository.interface';
import { IWallet, TCreateWalletData } from '../../../domain/interfaces/model/wallet.interface';

@injectable()
export class WalletRepository extends BaseRepository<TWalletDocument> implements IWalletRepository {
    constructor() {
        super(walletModel);
    }

    async createWallet(data: TCreateWalletData): Promise<IWallet | null> {
        const existing = await this.findOne({ userId: data.userId });
        if (existing) return null;
        const wallet = await this.create(data);
        return wallet.toObject<IWallet>();
    }

    async findUserWallet(userId: string, page: number, limit: number): Promise<{ wallet: IWallet | null, total: number }> {
        const skip = (page - 1) * 10;
        const total = await this.model.countDocuments({ userId });
        const wallet = await this.findOne({ userId })
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean<IWallet>().exec();
        return { wallet, total }
    }

    async updateBalance(userId: string, newBalance: number): Promise<void> {
        await this.model.findOneAndUpdate({ userId }, { balance: newBalance }).exec();
    }

    async addTransaction(userId: string, transaction: IWallet['transactions'][0]): Promise<void> {
        await this.model.updateOne(
            { userId },
            {
                $push: { transactions: transaction },
                $inc: {
                    balance: transaction.type === 'credit' ? transaction.amount : -transaction.amount,
                },
            }
        ).exec();
    }

    async findWalletExist(userId: string): Promise<boolean> {
        const wallet = await this.model.countDocuments({ userId }, { limit: 1 });
        return wallet ? true : false;
    }
}
