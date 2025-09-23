import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../../constants/token";
import { ITransactionRepository } from "../../../../domain/interfaces/repositories/transactionRepo.interface";
import { IWalletRepository } from "../../../../domain/interfaces/repositories/walletRepo.interface";
import { IGetTransactionsUseCase } from "../../../../domain/interfaces/model/wallet.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { TRANSACTION_RES_MESSAGES } from "../../../../constants/resMessages";
import { WALLET_ERROR_MESSAGES } from "../../../../constants/errorMessages";
import { TResponseTransactionDTO } from "../../../../interfaceAdapters/dtos/transactions.dto";
import { ResponseMapper } from "../../../../utils/responseMapper";


@injectable()
export class GetTransactionsUseCase implements IGetTransactionsUseCase {
    constructor(
        @inject(TOKENS.TransactionRepository) private _transactionRepository: ITransactionRepository,
        @inject(TOKENS.WalletRepository) private _walletRepository: IWalletRepository,
    ) { }

    async getTransactions(userId: string, page: number, limit: number): Promise<{ transactions: TResponseTransactionDTO[], total: number, message: string }> {
        const wallet = await this._walletRepository.findUserWallet(userId);
        if (!wallet || !wallet._id) {
            throw new AppError(WALLET_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        const { transactions, total } = await this._transactionRepository.findUserTransactions(wallet._id, page, limit);
        const mappedTransactions = transactions.map(t => ResponseMapper.mapTransactionToResponseDTO(t));

        return {
            transactions: mappedTransactions,
            total,
            message: TRANSACTION_RES_MESSAGES.getTransaction
        }
    }
}