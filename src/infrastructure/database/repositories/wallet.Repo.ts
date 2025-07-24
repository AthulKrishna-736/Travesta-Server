import { injectable } from 'tsyringe';
import { BaseRepository } from './baseRepo';
import { walletModel, TWalletDocument } from '../models/walletModel';
import { IWalletRepository } from '../../../domain/interfaces/repositories/repository.interface';
import { IWallet } from '../../../domain/interfaces/model/hotel.interface';

@injectable()
export class WalletRepository extends BaseRepository<TWalletDocument> implements IWalletRepository {
    constructor() {
        super(walletModel);
    }

    // Create wallet only once per user
    async createWallet(data: Partial<IWallet>): Promise<IWallet | null> {
        const existing = await this.findOne({ userId: data.userId });
        if (existing) return null; 
        const wallet = await this.create(data);
        return wallet.toObject<IWallet>();
    }

    async findByUserId(userId: string): Promise<IWallet | null> {
        return this.findOne({ userId }).lean<IWallet>().exec();
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
}
