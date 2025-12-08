import { inject, injectable } from "tsyringe";
import { IBookingRepository } from "../../../../domain/interfaces/repositories/bookingRepo.interface";
import { TOKENS } from "../../../../constants/token";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { AppError } from "../../../../utils/appError";
import { ICancelBookingUseCase } from "../../../../domain/interfaces/model/booking.interface";
import { BOOKING_RES_MESSAGES } from "../../../../constants/resMessages";
import { IWalletRepository } from "../../../../domain/interfaces/repositories/walletRepo.interface";
import { ITransactionRepository } from "../../../../domain/interfaces/repositories/transactionRepo.interface";
import { TCreateTransaction } from "../../../../domain/interfaces/model/wallet.interface";
import { AUTH_ERROR_MESSAGES, BOOKING_ERROR_MESSAGES, TRANSACTION_ERROR_MESSAGES, WALLET_ERROR_MESSAGES } from "../../../../constants/errorMessages";
import mongoose from "mongoose";
import { nanoid } from "nanoid";

@injectable()
export class CancelBookingUseCase implements ICancelBookingUseCase {
  constructor(
    @inject(TOKENS.BookingRepository) private _bookingRepository: IBookingRepository,
    @inject(TOKENS.WalletRepository) private _walletRepository: IWalletRepository,
    @inject(TOKENS.TransactionRepository) private _transactionRepository: ITransactionRepository,
  ) { }

  async cancelBooking(bookingId: string, userId: string): Promise<{ message: string }> {
    const booking = await this._bookingRepository.findByid(bookingId);
    if (!booking) throw new AppError(BOOKING_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);

    if (booking.userId.toString() !== userId) {
      throw new AppError(AUTH_ERROR_MESSAGES.invalidRole, HttpStatusCode.UNAUTHORIZED);
    }

    if (booking.status === "cancelled") {
      throw new AppError("Booking has already been cancelled", HttpStatusCode.BAD_REQUEST);
    }

    if (booking.status !== "confirmed" || booking.payment !== "success") {
      throw new AppError("Only confirmed and successfully paid bookings can be cancelled", HttpStatusCode.BAD_REQUEST);
    }

    const now = new Date();
    if (new Date(booking.checkOut).getTime() < now.getTime()) {
      throw new AppError("Cannot cancel a booking that has already ended", HttpStatusCode.BAD_REQUEST);
    }

    const hoursBeforeCheckIn = (new Date(booking.checkIn).getTime() - now.getTime()) / (1000 * 60 * 60);

    let chargePercentage = 0;
    if (hoursBeforeCheckIn >= 48) chargePercentage = 0;
    else if (hoursBeforeCheckIn >= 24) chargePercentage = 0.05;
    else if (hoursBeforeCheckIn >= 5) chargePercentage = 0.15;
    else if (hoursBeforeCheckIn >= 3) chargePercentage = 0.3;
    else if (hoursBeforeCheckIn >= 1) chargePercentage = 0.5;
    else chargePercentage = 0.75;

    const chargeAmount = booking.totalPrice * chargePercentage;
    const refundAmount = Math.max(booking.totalPrice - chargeAmount, 0);

    //vendor wallet transaction
    const vendorId = (booking.hotelId as any).vendorId;
    const vendorWallet = await this._walletRepository.findUserWallet(vendorId);
    if (!vendorWallet) throw new AppError(WALLET_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);


    const vendorTransactionData: TCreateTransaction = {
      walletId: new mongoose.Types.ObjectId(vendorWallet._id!),
      type: "debit",
      amount: refundAmount,
      description: `Refund for booking cancellation (${booking.bookingId})`,
      transactionId: `TRN-${nanoid(10)}`,
      relatedEntityId: new mongoose.Types.ObjectId(booking._id!),
      relatedEntityType: "Booking",
    };

    const vendorTransaction = await this._transactionRepository.createTransaction(vendorTransactionData);
    if (!vendorTransaction) throw new AppError(TRANSACTION_ERROR_MESSAGES.createFail, HttpStatusCode.INTERNAL_SERVER_ERROR);

    await this._walletRepository.updateBalanceByWalletId(vendorWallet._id!, -refundAmount);


    // user wallet transaction
    const userWallet = await this._walletRepository.findUserWallet(booking.userId.toString());
    if (!userWallet) throw new AppError(WALLET_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);

    const userTransactionData: TCreateTransaction = {
      walletId: new mongoose.Types.ObjectId(userWallet._id),
      type: "credit",
      amount: refundAmount,
      transactionId: `TRN-${nanoid(10)}`,
      description: `Refund for booking cancellation (${booking.bookingId})`,
      relatedEntityId: new mongoose.Types.ObjectId(booking._id!),
      relatedEntityType: 'Booking',
    };


    const userTransaction = await this._transactionRepository.createTransaction(userTransactionData);
    if (!userTransaction) throw new AppError(TRANSACTION_ERROR_MESSAGES.createFail, HttpStatusCode.INTERNAL_SERVER_ERROR);

    await this._walletRepository.updateBalanceByWalletId(userWallet._id!, refundAmount);

    //final updating booking
    booking.status = "cancelled";
    booking.payment = "refunded";
    await this._bookingRepository.save(booking);

    return { message: BOOKING_RES_MESSAGES.cancel };
  }
}
