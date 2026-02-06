import { injectable, inject } from 'tsyringe';
import { NextFunction, Request, Response } from 'express';
import { TOKENS } from '../../constants/token';
import { CustomRequest } from '../../utils/customRequest';
import { ResponseHandler } from '../../middlewares/responseHandler';
import { HttpStatusCode } from '../../constants/HttpStatusCodes';
import { AppError } from '../../utils/appError';
import { IBookingTransactionUseCase, ICreateWalletUseCase, IGetTransactionsUseCase, IGetWalletUseCase } from '../../domain/interfaces/model/wallet.interface';
import { IStripeService } from '../../domain/interfaces/services/stripeService.interface';
import { WALLET_RES_MESSAGES } from '../../constants/resMessages';
import { Pagination } from '../../shared/types/common.types';
import { AUTH_ERROR_MESSAGES } from '../../constants/errorMessages';
import { IWalletController } from '../../domain/interfaces/controllers/walletController.interface';
import { ISubscribePlanUseCase } from '../../domain/interfaces/model/subscription.interface';
import { TCreateBookingDTO } from '../dtos/booking.dto';
import { nanoid } from 'nanoid';


@injectable()
export class WalletController implements IWalletController {
    constructor(
        @inject(TOKENS.CreateWalletUseCase) private _createWalletUseCase: ICreateWalletUseCase,
        @inject(TOKENS.GetWalletUseCase) private _getWalletUseCase: IGetWalletUseCase,
        @inject(TOKENS.StripeService) private _stripeServiceUseCase: IStripeService,
        @inject(TOKENS.BookingTransactionUseCase) private _bookingConfirmUseCase: IBookingTransactionUseCase,
        @inject(TOKENS.GetTransactionsUseCase) private _getTransactionUseCase: IGetTransactionsUseCase,
        @inject(TOKENS.SubscribePlanUseCase) private _subscribePlanUseCase: ISubscribePlanUseCase,
        @inject(TOKENS.HandleStripeWebhookUseCase) private _handleStripeWebhookUseCase: any,
    ) { }

    async createWallet(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new AppError(AUTH_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);

            const { wallet, message } = await this._createWalletUseCase.createUserWallet(userId);
            ResponseHandler.success(res, message, wallet, HttpStatusCode.CREATED);
        } catch (error) {
            next(error);
        }
    }

    async getWallet(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new AppError(AUTH_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);

            const { wallet, message } = await this._getWalletUseCase.getUserWallet(userId);
            ResponseHandler.success(res, message, wallet, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async createPaymentIntent(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId
            const { amount, purpose, refId } = req.body;

            if (!userId || !amount) {
                throw new AppError(AUTH_ERROR_MESSAGES.invalidData, HttpStatusCode.BAD_REQUEST);
            }

            const STRIPE_AMOUNT = amount * 100;

            const result = await this._stripeServiceUseCase.createPaymentIntent(userId, STRIPE_AMOUNT, purpose, refId);
            ResponseHandler.success(res, WALLET_RES_MESSAGES.paymentIntent, result, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async BookingConfirmTransaction(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError('User id is missing', HttpStatusCode.BAD_REQUEST);
            }

            const { vendorId, hotelId, roomId, checkIn, checkOut, guests, roomsCount, couponId, method } = req.body;

            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);

            if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
                throw new AppError("Invalid check-in or check-out date format", HttpStatusCode.BAD_REQUEST);
            }

            if (checkOutDate <= checkInDate) {
                throw new AppError("Check-out date must be after check-in date", HttpStatusCode.BAD_REQUEST);
            }

            const bookingId = `BCK-${nanoid(10)}`;

            const bookingData: TCreateBookingDTO = {
                userId,
                hotelId,
                roomId,
                checkIn: checkInDate,
                checkOut: checkOutDate,
                totalPrice: 0,
                roomsCount,
                couponId,
                guests,
                bookingId,
            };
            const { message } = await this._bookingConfirmUseCase.bookingTransaction(vendorId, bookingData, method)
            ResponseHandler.success(res, message, null, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async getTransactions(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            const page = Number(req.query.page as string);
            const limit = Number(req.query.limit as string);

            if (!userId) {
                throw new AppError(AUTH_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);
            }

            const { transactions, total, message } = await this._getTransactionUseCase.getTransactions(userId, page, limit);
            const meta: Pagination = { currentPage: page, pageSize: limit, totalData: total, totalPages: Math.ceil(total / limit) }
            ResponseHandler.success(res, message, transactions, HttpStatusCode.OK, meta);
        } catch (error) {
            next(error);
        }
    }

    async subscriptionConfirmTransaction(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { method, planId } = req.body;

            if (!planId) {
                throw new AppError('Plan id missing', HttpStatusCode.BAD_REQUEST);
            }

            const { message } = await this._subscribePlanUseCase.subscribePlan(userId!, planId, method ?? 'wallet');
            ResponseHandler.success(res, message, null, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async webhookHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const signature = req.headers['stripe-signature'];

            if (typeof signature !== 'string') {
                throw new AppError('Invalid Stripe signature', HttpStatusCode.BAD_REQUEST);
            }

            const event = this._stripeServiceUseCase.constructWebhookEvent(req.body, signature);

            await this._handleStripeWebhookUseCase.execute(event);

            res.status(HttpStatusCode.OK).json({ received: true });
        } catch (error) {
            next(error);
        }
    }
}
