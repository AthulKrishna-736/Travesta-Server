import { injectable, inject } from 'tsyringe';
import { Response } from 'express';
import { TOKENS } from '../../constants/token';
import { CustomRequest } from '../../utils/customRequest';
import { ResponseHandler } from '../../middlewares/responseHandler';
import { HttpStatusCode } from '../../utils/HttpStatusCodes';
import { AppError } from '../../utils/appError';
import { ICreateWalletUseCase, IGetWalletUseCase, IAddWalletTransactionUseCase, TCreateWalletTransaction } from '../../domain/interfaces/model/wallet.interface';
import { IWalletTransaction } from '../../domain/interfaces/model/wallet.interface';
import { IStripeService } from '../../domain/interfaces/services/stripeService.interface';
import { Pagination } from '../../shared/types/common.types';

@injectable()
export class WalletController {
    constructor(
        @inject(TOKENS.CreateWalletUseCase) private _createWallet: ICreateWalletUseCase,
        @inject(TOKENS.GetWalletUseCase) private _getWallet: IGetWalletUseCase,
        @inject(TOKENS.AddWalletTransactionUseCase) private _addTransaction: IAddWalletTransactionUseCase,
        @inject(TOKENS.StripeService) private _stripeService: IStripeService,
    ) { }

    async createWallet(req: CustomRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new AppError("Missing userId", HttpStatusCode.BAD_REQUEST);

            const { wallet, message } = await this._createWallet.createUserWallet(userId);
            ResponseHandler.success(res, message, wallet, HttpStatusCode.CREATED);
        } catch (error) {
            throw error;
        }
    }

    async getWallet(req: CustomRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const page = Number(req.query.page);
            const limit = Number(req.query.limit);
            if (!userId) throw new AppError("Missing userId", HttpStatusCode.BAD_REQUEST);

            const { wallet, total, message } = await this._getWallet.getUserWallet(userId, page, limit);
            const meta: Pagination = { currentPage: page, pageSize: limit, totalData: total, totalPages: Math.ceil(total / limit) }
            ResponseHandler.success(res, message, wallet, HttpStatusCode.OK, meta);
        } catch (error) {
            throw error;
        }
    }

    async addTransaction(req: CustomRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new AppError("Missing userId", HttpStatusCode.BAD_REQUEST);

            const { amount, type, description, transactionId } = req.body;
            if (!amount || !type || !description || !transactionId) {
                throw new AppError("Invalid transaction data", HttpStatusCode.BAD_REQUEST);
            }

            const transaction: TCreateWalletTransaction = {
                type,
                amount,
                description: description?.trim(),
                transactionId,
            }

            const { message } = await this._addTransaction.addWalletAmount(userId, transaction);
            ResponseHandler.success(res, message, null, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }

    async createPaymentIntent(req: CustomRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId
            const { amount } = req.body;

            if (!userId || !amount) {
                throw new AppError("User ID and amount are required", HttpStatusCode.BAD_REQUEST);
            }

            const result = await this._stripeService.createPaymentIntent(userId, amount);
            ResponseHandler.success(res, "Proceed payment gateway", result, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }
}
