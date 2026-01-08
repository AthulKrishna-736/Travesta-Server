import mongoose from 'mongoose';
import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../../constants/token';
import { ITransactionRepository } from '../../../../domain/interfaces/repositories/transactionRepo.interface';
import { IWalletRepository } from '../../../../domain/interfaces/repositories/walletRepo.interface';
import { AppError } from '../../../../utils/appError';
import { HttpStatusCode } from '../../../../constants/HttpStatusCodes';
import { IBookingTransactionUseCase, TCreateTransaction } from '../../../../domain/interfaces/model/wallet.interface';
import { ICreateBookingUseCase } from '../../../../domain/interfaces/model/booking.interface';
import { WALLET_ERROR_MESSAGES } from '../../../../constants/errorMessages';
import { TCreateBookingDTO } from '../../../../interfaceAdapters/dtos/booking.dto';
import { nanoid } from 'nanoid';
import { IChatRepository } from '../../../../domain/interfaces/repositories/chatRepo.interface';
import { INotificationService } from '../../../../domain/interfaces/services/notificationService.interface';


@injectable()
export class BookingTransactionUseCase implements IBookingTransactionUseCase {
    constructor(
        @inject(TOKENS.WalletRepository) private _walletRepository: IWalletRepository,
        @inject(TOKENS.CreateBookingUseCase) private _bookingUsecase: ICreateBookingUseCase,
        @inject(TOKENS.TransactionRepository) private _transactionRepository: ITransactionRepository,
        @inject(TOKENS.ChatRepository) private _chatRepository: IChatRepository,
        @inject(TOKENS.NotificationService) private _notificationService: INotificationService,
    ) { }

    async bookingTransaction(vendorId: string, bookingData: TCreateBookingDTO, method: 'online' | 'wallet'): Promise<{ message: string }> {
        const [userWallet, vendorWallet] = await Promise.all([
            this._walletRepository.findUserWallet(bookingData.userId.toString()),
            this._walletRepository.findUserWallet(vendorId.toString()),
        ]);
        if (!userWallet || !vendorWallet) {
            throw new AppError(WALLET_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }
        if (method === 'wallet' && userWallet.balance < bookingData.totalPrice) {
            throw new AppError(WALLET_ERROR_MESSAGES.Insufficient, HttpStatusCode.BAD_REQUEST);
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const finalBookingData: TCreateBookingDTO = {
                ...bookingData,
                status: 'confirmed',
                payment: 'success',
            };

            const { booking } = await this._bookingUsecase.createBooking(finalBookingData, session);

            const relatedEntityId = new mongoose.Types.ObjectId(booking.id);
            const description = `Payment for booking ${booking.bookingId}`;
            const transactionId = `TRN-${nanoid(10)}`

            // Debit user
            const debitTransaction: TCreateTransaction = {
                walletId: userWallet.id,
                type: 'debit',
                amount: booking.totalPrice,
                description: description.trim(),
                transactionId,
                relatedEntityType: 'Booking',
                relatedEntityId
            };

            // Credit vendor
            const creditTransaction: TCreateTransaction = {
                walletId: vendorWallet.id,
                type: 'credit',
                amount: booking.totalPrice,
                description: description.trim(),
                transactionId,
                relatedEntityType: 'Booking',
                relatedEntityId
            };

            if (method === 'wallet') {
                await this._walletRepository.updateBalance(userWallet.userId.toString(), -booking.totalPrice, session);
                await this._walletRepository.updateBalance(vendorWallet.userId.toString(), booking.totalPrice, session);
            } else {
                await this._walletRepository.updateBalance(vendorWallet.userId.toString(), booking.totalPrice, session);
            }

            await this._transactionRepository.createTransaction(debitTransaction, session);
            await this._transactionRepository.createTransaction(creditTransaction, session);

            await this._notificationService.createAndPushNotification(
                {
                    userId: bookingData.userId.toString(),
                    title: "Booking Confirmed",
                    message: `Your booking (${booking.bookingId}) has been confirmed successfully.`,
                },
                session
            );

            await this._notificationService.createAndPushNotification(
                {
                    userId: vendorId.toString(),
                    title: "New Booking Received",
                    message: `You have received a new booking (${booking.bookingId}).`,
                },
                session
            );

            await this._chatRepository.createMessage({
                fromId: vendorId,
                toId: userWallet.userId.toString(),
                fromRole: 'vendor',
                toRole: 'user',
                message: 'Thankyou for booking our hotel. Please let us know if you have any queries',
            })

            await session.commitTransaction();
            session.endSession();

            return {
                message: `Your booking of ₹${booking.totalPrice} was successfully processed via ${method}.`
            };

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
}
