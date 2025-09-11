import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../../constants/token";
import { ITransactionRepository, IWalletRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { IAddMoneyToWalletUseCase, TCreateTransaction, TResponseTransactions } from "../../../../domain/interfaces/model/wallet.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import mongoose from "mongoose";
import { WALLET_RES_MESSAGES } from "../../../../constants/resMessages";

@injectable()
export class AddMoneyToWalletUseCase implements IAddMoneyToWalletUseCase {
    constructor(
        @inject(TOKENS.WalletRepository) private _walletRepository: IWalletRepository,
        @inject(TOKENS.TransactionRepository) private _transactionRepository: ITransactionRepository,
    ) { }

    async addMoneyToWallet(userId: string, amount: number): Promise<{ transaction: TResponseTransactions; message: string; }> {
        const wallet = await this._walletRepository.findUserWallet(userId);
        if (!wallet) {
            throw new AppError('Wallet not found', HttpStatusCode.NOT_FOUND);
        }

        const transactionData: TCreateTransaction = {
            walletId: new mongoose.Types.ObjectId(wallet._id),
            type: 'credit',
            amount,
            description: `Wallet credited via Stripe payment`,
        }

        const transaction = await this._transactionRepository.createTransaction(transactionData);
        if (!transaction) {
            throw new AppError('Failed to create transaction', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const updateWallet = await this._walletRepository.updateBalanceByWalletId(wallet._id!, amount);
        if (!updateWallet) {
            throw new AppError('Failed to update wallet', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        return {
            transaction,
            message: `₹${amount} has been ${WALLET_RES_MESSAGES.update}`,
        }
    }
}