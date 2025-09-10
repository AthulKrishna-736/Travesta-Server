import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../../constants/token';
import { IBookingRepository } from '../../../../domain/interfaces/repositories/repository.interface';
import { formatDateString } from '../../../../utils/dateFormatter';
import { IGetBookingsByUserUseCase, TResponseBookingData } from '../../../../domain/interfaces/model/booking.interface';

@injectable()
export class GetBookingsByUserUseCase implements IGetBookingsByUserUseCase {
  constructor(
    @inject(TOKENS.BookingRepository) private _bookingRepository: IBookingRepository
  ) { }

  async getBookingByUser(userId: string, page: number, limit: number): Promise<{ bookings: TResponseBookingData[], total: number }> {
    const { bookings, total } = await this._bookingRepository.findBookingsByUser(userId, page, limit);

    const mappedBookings = bookings.map(b => ({
      ...b,
      checkIn: formatDateString(b.checkIn.toString()),
      checkOut: formatDateString(b.checkOut.toString()),
    }));

    return {
      bookings: mappedBookings,
      total
    }
  }
}
