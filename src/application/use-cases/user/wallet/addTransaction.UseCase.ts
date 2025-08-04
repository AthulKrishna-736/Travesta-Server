import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../../constants/token';
import { IWalletRepository } from '../../../../domain/interfaces/repositories/repository.interface';
import { AppError } from '../../../../utils/appError';
import { HttpStatusCode } from '../../../../utils/HttpStatusCodes';
import { IAddWalletTransactionUseCase, TCreateWalletTransaction } from '../../../../domain/interfaces/model/wallet.interface';

@injectable()
export class AddWalletTransactionUseCase implements IAddWalletTransactionUseCase {
    constructor(
        @inject(TOKENS.WalletRepository) private _walletRepo: IWalletRepository
    ) { }

    async addWalletAmount(userId: string, transaction: TCreateWalletTransaction): Promise<{ message: string }> {
        const wallet = await this._walletRepo.findWalletExist(userId);
        if (!wallet) {
            throw new AppError('Wallet not found', HttpStatusCode.NOT_FOUND);
        }

        if (transaction.type === 'debit') {
            throw new AppError('invalid user transaction', HttpStatusCode.CONFLICT);
        }

        if (transaction.amount <= 0) {
            throw new AppError('amount must be great than 0', HttpStatusCode.CONFLICT);
        }

        if (transaction.amount >= 2000) {
            throw new AppError('amount must be below 2000', HttpStatusCode.CONFLICT);
        }

        if (transaction.description.trim().length == 0 || typeof transaction.description !== 'string') {
            throw new AppError('description must be at least 10 characters', HttpStatusCode.BAD_REQUEST);
        }

        const finalTransactionData = {
            ...transaction,
            date: new Date(),
        }

        const updatedWallet = await this._walletRepo.addTransaction(userId, finalTransactionData);
        if (updatedWallet) {
            return { message: `${transaction.amount}rs credited successfully` }
        }

        return { message: 'error while crediting amount' }
    }
}
