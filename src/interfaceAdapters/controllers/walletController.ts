import { injectable, inject } from 'tsyringe';
import { NextFunction, Request, Response } from 'express';
import { TOKENS } from '../../constants/token';
import { CustomRequest } from '../../utils/customRequest';
import { ResponseHandler } from '../../middlewares/responseHandler';
import { HttpStatusCode } from '../../constants/HttpStatusCodes';
import { AppError } from '../../utils/appError';
import { IAddMoneyToWalletUseCase, IBookingTransactionUseCase, ICreateWalletUseCase, IGetTransactionsUseCase, IGetWalletUseCase } from '../../domain/interfaces/model/wallet.interface';
import { IStripeService } from '../../domain/interfaces/services/stripeService.interface';
import { WALLET_RES_MESSAGES } from '../../constants/resMessages';
import { Pagination } from '../../shared/types/common.types';
import { AUTH_ERROR_MESSAGES } from '../../constants/errorMessages';
import { IWalletController } from '../../domain/interfaces/controllers/walletController.interface';
import { ISubscribePlanUseCase } from '../../domain/interfaces/model/subscription.interface';
import { TCreateBookingDTO } from '../dtos/booking.dto';
import { nanoid } from 'nanoid';
import { env } from '../../infrastructure/config/env';
import Stripe from 'stripe';

@injectable()
export class WalletController implements IWalletController {
    constructor(
        @inject(TOKENS.CreateWalletUseCase) private _createWalletUseCase: ICreateWalletUseCase,
        @inject(TOKENS.GetWalletUseCase) private _getWalletUseCase: IGetWalletUseCase,
        @inject(TOKENS.StripeService) private _stripeServiceUseCase: IStripeService,
        @inject(TOKENS.BookingTransactionUseCase) private _bookingConfirmUseCase: IBookingTransactionUseCase,
        @inject(TOKENS.AddMoneyToWalletUseCase) private _addMoneyToWalletUseCase: IAddMoneyToWalletUseCase,
        @inject(TOKENS.GetTransactionsUseCase) private _getTransactionUseCase: IGetTransactionsUseCase,
        @inject(TOKENS.SubscribePlanUseCase) private _subscribePlanUseCase: ISubscribePlanUseCase,
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
            const { amount } = req.body;

            if (!userId || !amount) {
                throw new AppError(AUTH_ERROR_MESSAGES.invalidData, HttpStatusCode.BAD_REQUEST);
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

            const { hotelId, roomId, checkIn, checkOut, guests, totalPrice, roomsCount, couponId } = req.body;

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

            const bookingId = `BCK-${nanoid(10)}`;

            const bookingData: TCreateBookingDTO = {
                userId,
                hotelId,
                roomId,
                checkIn: checkInDate,
                checkOut: checkOutDate,
                roomsCount,
                couponId,
                guests,
                totalPrice,
                bookingId,
            };
            const { message } = await this._bookingConfirmUseCase.bookingTransaction(vendorId, bookingData, method)
            ResponseHandler.success(res, message, null, HttpStatusCode.OK);
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
            const planId = req.params.planId;
            const { method } = req.query as { method: 'wallet' | 'online' };

            const { message } = await this._subscribePlanUseCase.subscribePlan(userId!, planId, method);
            ResponseHandler.success(res, message, null, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async webhookHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
        let event;

        if (!env.STRIPE_WEBHOOK_SECRET) {
            throw new AppError('Webhook secret missing', HttpStatusCode.BAD_REQUEST)
        }

        const signature = req.headers['stripe-signature'];

        if (typeof signature !== 'string') {
            throw new AppError('Invalid Stripe signature', HttpStatusCode.BAD_REQUEST);
        }

        try {
            event = Stripe.webhooks.constructEvent(
                req.body,
                signature,
                env.STRIPE_WEBHOOK_SECRET,
            );

        } catch (error) {
            console.log(`⚠️ Webhook signature verification failed.`, error);
            throw new AppError('Webhook verification failed', HttpStatusCode.BAD_GATEWAY);
        }

        try {
            switch (event.type) {

                case 'payment_intent.succeeded': {
                    const pi = event.data.object as Stripe.PaymentIntent;

                    // idempotency check (MANDATORY)
                    if (await this._paymentRepo.isProcessed(pi.id)) {
                        break;
                    }

                    switch (pi.metadata.purpose) {

                        case 'wallet':
                            await this._addMoneyToWalletUseCase.addMoneyToWallet(
                                pi.metadata.userId,
                                pi.amount / 100
                            );
                            break;

                        case 'booking':
                            await this._bookingConfirmUseCase.bookingTransaction(pi.metadata.userId,
                                pi.metadata.refId // bookingId
                            );
                            break;

                        case 'subscription':
                            await this._subscribePlanUseCase.activateSubscription(
                                pi.metadata.userId,
                                pi.metadata.refId // planId
                            );
                            break;
                    }

                    await this._paymentRepo.markProcessed(pi.id);
                    break;
                }

                case 'payment_intent.payment_failed': {
                    console.log('❌ Payment failed:', event.data.object);
                    break;
                }

                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }

            res.status(200).json({ received: true });

        } catch (error) {
            console.error('Webhook handler error:', error);
            throw new AppError('Webhook processing failed', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }
    }
}
