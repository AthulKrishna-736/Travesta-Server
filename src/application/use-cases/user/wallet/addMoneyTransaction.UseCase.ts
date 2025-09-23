import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../../constants/token";
import { ITransactionRepository } from "../../../../domain/interfaces/repositories/transactionRepo.interface";
import { IWalletRepository } from "../../../../domain/interfaces/repositories/walletRepo.interface";
import { IAddMoneyToWalletUseCase, TCreateTransaction } from "../../../../domain/interfaces/model/wallet.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import mongoose from "mongoose";
import { WALLET_RES_MESSAGES } from "../../../../constants/resMessages";
import { TRANSACTION_ERROR_MESSAGES, WALLET_ERROR_MESSAGES } from "../../../../constants/errorMessages";
import { TResponseTransactionDTO } from "../../../../interfaceAdapters/dtos/transactions.dto";
import { ResponseMapper } from "../../../../utils/responseMapper";

@injectable()
export class AddMoneyToWalletUseCase implements IAddMoneyToWalletUseCase {
    constructor(
        @inject(TOKENS.WalletRepository) private _walletRepository: IWalletRepository,
        @inject(TOKENS.TransactionRepository) private _transactionRepository: ITransactionRepository,
    ) { }

    async addMoneyToWallet(userId: string, amount: number): Promise<{ transaction: TResponseTransactionDTO; message: string; }> {
        const wallet = await this._walletRepository.findUserWallet(userId);
        if (!wallet) {
            throw new AppError(WALLET_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        const transactionData: TCreateTransaction = {
            walletId: new mongoose.Types.ObjectId(wallet._id),
            type: 'credit',
            amount,
            description: `Wallet credited via Stripe payment`,
        }

        const transaction = await this._transactionRepository.createTransaction(transactionData);
        if (!transaction) {
            throw new AppError(TRANSACTION_ERROR_MESSAGES.createFail, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const updateWallet = await this._walletRepository.updateBalanceByWalletId(wallet._id!, amount);
        if (!updateWallet) {
            throw new AppError(WALLET_ERROR_MESSAGES.updateFail, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const mappedTransaction = ResponseMapper.mapTransactionToResponseDTO(transaction);

        return {
            transaction: mappedTransaction,
            message: `₹${amount} has been ${WALLET_RES_MESSAGES.update}`,
        }
    }
}