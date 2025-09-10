import { injectable, inject } from 'tsyringe';
import { NextFunction, Response } from 'express';
import { TOKENS } from '../../constants/token';
import { CustomRequest } from '../../utils/customRequest';
import { ResponseHandler } from '../../middlewares/responseHandler';
import { HttpStatusCode } from '../../constants/HttpStatusCodes';
import { AppError } from '../../utils/appError';
import { IAddMoneyToWalletUseCase, IBookingTransactionUseCase, ICreateWalletUseCase, IGetTransactionsUseCase, IGetWalletUseCase } from '../../domain/interfaces/model/wallet.interface';
import { IStripeService } from '../../domain/interfaces/services/stripeService.interface';
import { TCreateBookingData } from '../../domain/interfaces/model/booking.interface';
import { WALLET_RES_MESSAGES } from '../../constants/resMessages';
import { Pagination } from '../../shared/types/common.types';

@injectable()
export class WalletController {
    constructor(
        @inject(TOKENS.CreateWalletUseCase) private _createWalletUseCase: ICreateWalletUseCase,
        @inject(TOKENS.GetWalletUseCase) private _getWalletUseCase: IGetWalletUseCase,
        @inject(TOKENS.StripeService) private _stripeServiceUseCase: IStripeService,
        @inject(TOKENS.BookingTransactionUseCase) private _bookingConfirmUseCase: IBookingTransactionUseCase,
        @inject(TOKENS.AddMoneyToWalletUseCase) private _addMoneyToWalletUseCase: IAddMoneyToWalletUseCase,
        @inject(TOKENS.GetTransactionsUseCase) private _getTransactionUseCase: IGetTransactionsUseCase,
    ) { }

    async createWallet(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new AppError("Missing userId", HttpStatusCode.BAD_REQUEST);

            const { wallet, message } = await this._createWalletUseCase.createUserWallet(userId);
            ResponseHandler.success(res, message, wallet, HttpStatusCode.CREATED);
        } catch (error) {
            next(error);
        }
    }

    async getWallet(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new AppError("Missing userId", HttpStatusCode.BAD_REQUEST);

            const { wallet, message } = await this._getWalletUseCase.getUserWallet(userId);
            ResponseHandler.success(res, message, wallet, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async createPaymentIntent(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId
            const { amount } = req.body;

            if (!userId || !amount) {
                throw new AppError("User ID and amount are required", HttpStatusCode.BAD_REQUEST);
            }

            const result = await this._stripeServiceUseCase.createPaymentIntent(userId, amount);
            ResponseHandler.success(res, WALLET_RES_MESSAGES.paymentIntent, result, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async BookingConfirmTransaction(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { vendorId } = req.params;
            const { method } = req.query as { method: 'wallet' | 'online' };
            if (!vendorId || !method || !userId) {
                throw new AppError('User, Vendor id or method is missing', HttpStatusCode.BAD_REQUEST);
            }

            const { hotelId, roomId, checkIn, checkOut, guests, totalPrice } = req.body;

            if (!hotelId || !roomId || !checkIn || !checkOut || !guests || !totalPrice) {
                throw new AppError('booking confirmation fields is missing', HttpStatusCode.BAD_REQUEST);
            }

            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);

            if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
                throw new AppError("Invalid check-in or check-out date format", HttpStatusCode.BAD_REQUEST);
            }

            if (checkOutDate <= checkInDate) {
                throw new AppError("Check-out date must be after check-in date", HttpStatusCode.BAD_REQUEST);
            }

            const bookingData: TCreateBookingData = {
                userId,
                hotelId,
                roomId,
                checkIn: checkInDate,
                checkOut: checkOutDate,
                guests,
                totalPrice,
            };
            const { transaction, message } = await this._bookingConfirmUseCase.bookingTransaction(vendorId, bookingData, method)
            ResponseHandler.success(res, message, transaction, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async AddMoneyTransaction(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { amount } = req.body;

            if (!userId) {
                throw new AppError('User id is missing', HttpStatusCode.BAD_REQUEST);
            }

            if (typeof amount !== 'number') {
                throw new AppError('Amount should be positive number', HttpStatusCode.BAD_REQUEST);
            }

            if (amount < 1 || amount > 2000) {
                throw new AppError('Amount shoube between 1 to 2000', HttpStatusCode.BAD_REQUEST);
            }

            const { transaction, message } = await this._addMoneyToWalletUseCase.addMoneyToWallet(userId, amount);
            ResponseHandler.success(res, message, transaction, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async getTransactions(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            const page = parseInt(req.query.page as string);
            const limit = parseInt(req.query.limit as string);
            if (!userId) {
                throw new AppError('User id is missing', HttpStatusCode.BAD_REQUEST);
            }
            const { transactions, total, message } = await this._getTransactionUseCase.getTransactions(userId, page, limit);
            const meta: Pagination = { currentPage: page, pageSize: limit, totalData: total, totalPages: Math.ceil(total / limit) }
            ResponseHandler.success(res, message, transactions, HttpStatusCode.OK, meta);
        } catch (error) {
            next(error);
        }
    }
}
