import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../../constants/token';
import { IWalletRepository } from '../../../../domain/interfaces/repositories/repository.interface';
import { AppError } from '../../../../utils/appError';
import { HttpStatusCode } from '../../../../utils/HttpStatusCodes';
import { IAddWalletTransactionUseCase, IWalletTransaction } from '../../../../domain/interfaces/model/wallet.interface';

@injectable()
export class AddWalletTransactionUseCase implements IAddWalletTransactionUseCase {
    constructor(
        @inject(TOKENS.WalletRepository) private _walletRepo: IWalletRepository
    ) { }

    async execute(userId: string, transaction: IWalletTransaction): Promise<void> {
        const wallet = await this._walletRepo.findWalletExist(userId);
        if (!wallet) {
            throw new AppError('Wallet not found', HttpStatusCode.NOT_FOUND);
        }

        if (transaction.type === 'debit' && wallet.balance < transaction.amount) {
            throw new AppError('Insufficient balance', HttpStatusCode.BAD_REQUEST);
        }

        await this._walletRepo.addTransaction(userId, transaction);
    }
}
