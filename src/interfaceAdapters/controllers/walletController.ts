import { injectable, inject } from 'tsyringe';
import { Response } from 'express';
import { TOKENS } from '../../constants/token';
import { CustomRequest } from '../../utils/customRequest';
import { ResponseHandler } from '../../middlewares/responseHandler';
import { HttpStatusCode } from '../../utils/HttpStatusCodes';
import { AppError } from '../../utils/appError';
import { ICreateWalletUseCase, IGetWalletUseCase, IAddWalletTransactionUseCase, IStripeService } from '../../domain/interfaces/model/wallet.interface';
import { IWalletTransaction } from '../../domain/interfaces/model/wallet.interface';

@injectable()
export class WalletController {
    constructor(
        @inject(TOKENS.CreateWalletUseCase) private _createWallet: ICreateWalletUseCase,
        @inject(TOKENS.GetWalletUseCase) private _getWallet: IGetWalletUseCase,
        @inject(TOKENS.AddWalletTransactionUseCase) private _addTransaction: IAddWalletTransactionUseCase,
        @inject(TOKENS.StripeService) private _stripeService: IStripeService
    ) { }

    async createWallet(req: CustomRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new AppError("Missing userId", HttpStatusCode.BAD_REQUEST);

            const wallet = await this._createWallet.execute(userId);
            ResponseHandler.success(res, "Wallet created successfully", wallet, HttpStatusCode.CREATED);
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

            const wallet = await this._getWallet.execute(userId, page, limit);
            ResponseHandler.success(res, "Wallet fetched successfully", wallet, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }

    async addTransaction(req: CustomRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new AppError("Missing userId", HttpStatusCode.BAD_REQUEST);

            const transaction: IWalletTransaction = req.body;
            if (!transaction || !transaction.amount || !transaction.type) {
                throw new AppError("Invalid transaction data", HttpStatusCode.BAD_REQUEST);
            }

            await this._addTransaction.execute(userId, transaction);
            ResponseHandler.success(res, "Transaction added successfully", null, HttpStatusCode.OK);
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
            ResponseHandler.success(res, "PaymentIntent created", result, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }
}
