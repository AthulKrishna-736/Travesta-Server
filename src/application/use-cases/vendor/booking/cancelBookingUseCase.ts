import { inject, injectable } from "tsyringe";
import { IBookingRepository, IWalletRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { TOKENS } from "../../../../constants/token";
import { HttpStatusCode } from "../../../../utils/HttpStatusCodes";
import { AppError } from "../../../../utils/appError";
import { ICancelBookingUseCase } from "../../../../domain/interfaces/model/booking.interface";
import mongoose from "mongoose";

@injectable()
export class CancelBookingUseCase implements ICancelBookingUseCase {
  constructor(
    @inject(TOKENS.BookingRepository) private _bookingRepo: IBookingRepository,
    @inject(TOKENS.WalletRepository) private _walletRepo: IWalletRepository,
  ) { }

  async execute(bookingId: string, userId: string): Promise<{ message: string }> {
    const booking = await this._bookingRepo.findByid(bookingId);
    if (!booking) {
      throw new AppError("Booking not found", HttpStatusCode.NOT_FOUND);
    }

    if (booking.userId.toString() !== userId) {
      throw new AppError("Unauthorized access", HttpStatusCode.UNAUTHORIZED);
    }
    const refundAmount = booking.totalPrice * 0.9;

    await this._walletRepo.addTransaction(booking.userId.toString(), {
      type: 'credit',
      amount: refundAmount,
      description: `Refund for booking cancellation (${bookingId})`,
      relatedBookingId: booking._id,
      transactionId: new mongoose.Types.ObjectId().toString(),
    });

    booking.status = "cancelled";
    booking.payment.status = "refunded";

    await this._bookingRepo.save(booking);

    return { message: "Booking cancelled successfully" };
  }
}
