import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../../constants/token";
import { ITransactionRepository, IWalletRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { IGetTransactionsUseCase, TResponseTransactions } from "../../../../domain/interfaces/model/wallet.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { TRANSACTION_RES_MESSAGES } from "../../../../constants/resMessages";


@injectable()
export class GetTransactionsUseCase implements IGetTransactionsUseCase {
    constructor(
        @inject(TOKENS.TransactionRepository) private _transactionRepository: ITransactionRepository,
        @inject(TOKENS.WalletRepository) private _walletRepository: IWalletRepository,
    ) { }

    async getTransactions(userId: string, page: number, limit: number): Promise<{ transactions: TResponseTransactions[], total: number, message: string }> {
        const wallet = await this._walletRepository.findUserWallet(userId);
        if (!wallet || !wallet._id) {
            throw new AppError('Wallet not found', HttpStatusCode.NOT_FOUND);
        }

        const { transactions, total } = await this._transactionRepository.findUserTransactions(wallet._id, page, limit);

        return {
            transactions,
            total,
            message: TRANSACTION_RES_MESSAGES.getTransaction
        }
    }
}