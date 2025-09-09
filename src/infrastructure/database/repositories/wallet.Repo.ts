import { injectable } from 'tsyringe';
import { BaseRepository } from './baseRepo';
import { TWalletDocument, walletModel } from '../models/walletModel';
import { IWalletRepository } from '../../../domain/interfaces/repositories/repository.interface';
import { TCreateWalletData } from '../../../domain/interfaces/model/wallet.interface';

@injectable()
export class WalletRepository extends BaseRepository<TWalletDocument> implements IWalletRepository {
    constructor() {
        super(walletModel);
    }

    async createWallet(data: TCreateWalletData): Promise<TWalletDocument | null> {
        const wallet = await this.create(data);
        return wallet;
    }

    async findUserWallet(userId: string): Promise<TWalletDocument | null> {
        const wallet = await this.findOne({ userId }).exec();
        return wallet;
    }

    async findWalletById(walletId: string): Promise<TWalletDocument | null> {
        const wallet = await this.findOne({ _id: walletId }).exec();
        return wallet;
    }

    async updateBalance(userId: string, amount: number): Promise<TWalletDocument | null> {
        const wallet = await this.model.findByIdAndUpdate(
            { userId },
            { $inc: { balance: amount } },
            { new: true },
        );
        return wallet;
    }

    async updateBalanceByWalletId(walletId: string, amount: number): Promise<TWalletDocument | null> {
        return this.model.findByIdAndUpdate(
            walletId,
            { $inc: { balance: amount } },
            { new: true }
        );
    }
}
