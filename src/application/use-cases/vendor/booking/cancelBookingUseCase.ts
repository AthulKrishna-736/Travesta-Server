import { inject, injectable } from "tsyringe";
import { IBookingRepository, IWalletRepository, ITransactionRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { TOKENS } from "../../../../constants/token";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { AppError } from "../../../../utils/appError";
import { ICancelBookingUseCase } from "../../../../domain/interfaces/model/booking.interface";
import { BOOKING_RES_MESSAGES } from "../../../../constants/resMessages";

@injectable()
export class CancelBookingUseCase implements ICancelBookingUseCase {
  constructor(
    @inject(TOKENS.BookingRepository) private _bookingRepository: IBookingRepository,
    @inject(TOKENS.WalletRepository) private _walletRepository: IWalletRepository,
    @inject(TOKENS.TransactionRepository) private _transactionRepository: ITransactionRepository,
  ) { }

  async cancelBooking(bookingId: string, userId: string): Promise<{ message: string }> {

    const booking = await this._bookingRepository.findByid(bookingId);
    if (!booking) throw new AppError("Booking not found", HttpStatusCode.NOT_FOUND);

    if (booking.userId.toString() !== userId) throw new AppError("Unauthorized access", HttpStatusCode.UNAUTHORIZED);

    if (booking.status === 'cancelled') throw new AppError("Booking has already been cancelled", HttpStatusCode.BAD_REQUEST);

    if (booking.status !== 'confirmed' || booking.payment !== 'success') throw new AppError("Only confirmed and successfully paid bookings can be refunded", HttpStatusCode.BAD_REQUEST);

    const timeDiffInHours = (Date.now() - new Date(booking.createdAt).getTime()) / (1000 * 60 * 60);
    if (timeDiffInHours > 3) throw new AppError("Bookings can only be cancelled within 3 hours of creation", HttpStatusCode.BAD_REQUEST);

    const refundAmount = booking.totalPrice * 0.9;
    const vendorId = (booking.hotelId as any).vendorId;

    const vendorWallet = await this._walletRepository.findUserWallet(vendorId);
    if (!vendorWallet) throw new AppError("Vendor wallet not found", HttpStatusCode.NOT_FOUND);

    const vendorTransactionData = {
      walletId: vendorWallet._id!,
      type: 'debit',
      amount: refundAmount,
      description: `Refund for booking cancellation (${bookingId})`,
      relatedEntityId: booking._id!,
      relatedEntityType: 'Booking',
    };

    const vendorTransaction = await this._transactionRepository.createTransaction(vendorTransactionData);
    if (!vendorTransaction) throw new AppError("Failed to create vendor transaction", HttpStatusCode.INTERNAL_SERVER_ERROR);

    await this._walletRepository.updateBalanceByWalletId(vendorWallet._id!, -refundAmount);

    const userWallet = await this._walletRepository.findUserWallet(booking.userId.toString());
    if (!userWallet) throw new AppError("User wallet not found", HttpStatusCode.NOT_FOUND);

    const userTransactionData = {
      walletId: userWallet._id!,
      type: 'credit',
      amount: refundAmount,
      description: `Refund for booking cancellation (${bookingId})`,
      relatedBookingId: booking._id!,
    };

    const userTransaction = await this._transactionRepository.createTransaction(userTransactionData);
    if (!userTransaction) throw new AppError("Failed to create user transaction", HttpStatusCode.INTERNAL_SERVER_ERROR);

    await this._walletRepository.updateBalanceByWalletId(userWallet._id!, refundAmount);

    booking.status = "cancelled";
    booking.payment = "refunded";
    await this._bookingRepository.save(booking);

    return { message: BOOKING_RES_MESSAGES.cancel };
  }
}
