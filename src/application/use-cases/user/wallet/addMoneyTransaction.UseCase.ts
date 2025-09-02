import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../../constants/token";
import { ITransactionRepository, IWalletRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { IAddMoneyToWalletUseCase, TCreateTransaction, TResponseTransactions } from "../../../../domain/interfaces/model/wallet.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../utils/HttpStatusCodes";
import mongoose from "mongoose";

@injectable()
export class AddMoneyToWalletUseCase implements IAddMoneyToWalletUseCase {
    constructor(
        @inject(TOKENS.WalletRepository) private _walletRepo: IWalletRepository,
        @inject(TOKENS.TransactionRepository) private _transactionRepo: ITransactionRepository,
    ) { }

    async addMoneyToWallet(userId: string, amount: number): Promise<{ transaction: TResponseTransactions; message: string; }> {
        const wallet = await this._walletRepo.findUserWallet(userId);
        if (!wallet) {
            throw new AppError('Wallet not found', HttpStatusCode.NOT_FOUND);
        }

        const transactionData: TCreateTransaction = {
            walletId: new mongoose.Types.ObjectId(wallet._id),
            type: 'credit',
            amount,
            description: `Wallet credited via Stripe payment`,
        }

        const transaction = await this._transactionRepo.createTransaction(transactionData);
        if (!transaction) {
            throw new AppError('Failed to create transaction', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const updateWallet = await this._walletRepo.updateBalanceByWalletId(wallet._id!, amount);
        if (!updateWallet) {
            throw new AppError('Failed to update wallet', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }
        
        return {
            transaction,
            message: `₹${amount} has been added to your wallet successfully`,
        }
    }
}