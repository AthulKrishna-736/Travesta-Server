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
import { IRoomRepository } from '../../../../domain/interfaces/repositories/roomRepo.interface';
import { IOfferRepository } from '../../../../domain/interfaces/repositories/offerRepo.interface';
import { ICouponRepository } from '../../../../domain/interfaces/repositories/couponRepo.interface';


@injectable()
export class BookingTransactionUseCase implements IBookingTransactionUseCase {
    constructor(
        @inject(TOKENS.WalletRepository) private _walletRepository: IWalletRepository,
        @inject(TOKENS.CreateBookingUseCase) private _bookingUsecase: ICreateBookingUseCase,
        @inject(TOKENS.TransactionRepository) private _transactionRepository: ITransactionRepository,
        @inject(TOKENS.ChatRepository) private _chatRepository: IChatRepository,
        @inject(TOKENS.RoomRepository) private _roomRepository: IRoomRepository,
        @inject(TOKENS.OfferRepository) private _offerRepository: IOfferRepository,
        @inject(TOKENS.CouponRepository) private _couponRepository: ICouponRepository,
        @inject(TOKENS.NotificationService) private _notificationService: INotificationService,
    ) { }


    private async calculateFinalPrice(booking: TCreateBookingDTO): Promise<{
        baseAmount: number,
        offerDiscount: number,
        couponDiscount: number,
        finalAmount: number
    }> {

        const nights = (booking.checkOut.getTime() - booking.checkIn.getTime()) / (1000 * 60 * 60 * 24);

        if (nights <= 0) {
            throw new AppError('Invalid stay duration', HttpStatusCode.BAD_REQUEST);
        }

        const { price, roomType, hotelId } = await this._roomRepository.getRoomPrice(booking.roomId);

        let baseAmount = price * nights * booking.roomsCount;

        let offerDiscount = 0;
        const offers = await this._offerRepository.findApplicableOffers(
            roomType,
            new Date(),
            hotelId
        );

        if (offers.length) {
            const bestOffer = offers.reduce((best, curr) => curr.discountValue > best.discountValue ? curr : best);

            offerDiscount = bestOffer.discountType === 'percent' ? (baseAmount * bestOffer.discountValue) / 100 : bestOffer.discountValue;
        }

        let amountAfterOffer = baseAmount - offerDiscount;

        let couponDiscount = 0;
        if (booking.couponId) {
            const coupon = await this._couponRepository.validateCoupon(booking.couponId, booking.userId, amountAfterOffer);
            couponDiscount = coupon.type === 'percent' ? (amountAfterOffer * coupon.value) / 100 : coupon.value;
        }

        const finalAmount = Math.max(amountAfterOffer - couponDiscount, 0);

        return {
            baseAmount,
            offerDiscount,
            couponDiscount,
            finalAmount,
        };
    }

    async bookingTransaction(vendorId: string, bookingData: TCreateBookingDTO, method: 'online' | 'wallet'): Promise<{ message: string }> {
        const [userWallet, vendorWallet] = await Promise.all([
            this._walletRepository.findUserWallet(bookingData.userId.toString()),
            this._walletRepository.findUserWallet(vendorId.toString()),
        ]);
        if (!userWallet || !vendorWallet) {
            throw new AppError(WALLET_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        const price = await this.calculateFinalPrice(bookingData);

        if (method === 'wallet' && userWallet.balance < price.finalAmount) {
            throw new AppError(WALLET_ERROR_MESSAGES.Insufficient, HttpStatusCode.BAD_REQUEST);
        }

        // started transactions
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const finalBookingData: TCreateBookingDTO & { totalPrice: number } = {
                ...bookingData,
                totalPrice: price.finalAmount,
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
