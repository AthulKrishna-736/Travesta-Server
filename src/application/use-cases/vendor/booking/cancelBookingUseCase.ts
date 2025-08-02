import { inject, injectable } from "tsyringe";
import { IBookingRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { TOKENS } from "../../../../constants/token";
import { HttpStatusCode } from "../../../../utils/HttpStatusCodes";
import { AppError } from "../../../../utils/appError";
import { ICancelBookingUseCase } from "../../../../domain/interfaces/model/booking.interface";

@injectable()
export class CancelBookingUseCase implements ICancelBookingUseCase {
  constructor(
    @inject(TOKENS.BookingRepository)
    private _bookingRepo: IBookingRepository
  ) { }

  async execute(bookingId: string, userId: string): Promise<{ message: string }> {
    const booking = await this._bookingRepo.findByid(bookingId);
    if (!booking) {
      throw new AppError("Booking not found", HttpStatusCode.NOT_FOUND);
    }

    if (booking.userId.toString() !== userId) {
      throw new AppError("Unauthorized access", HttpStatusCode.UNAUTHORIZED);
    }

    booking.status = "cancelled";

    await this._bookingRepo.save(booking);

    return { message: "Booking cancelled successfully" };
  }
}
