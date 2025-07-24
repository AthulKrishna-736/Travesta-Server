import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../../constants/token';
import { IGetBookingsByUserUseCase } from '../../../../domain/interfaces/model/usecases.interface';
import { IBookingRepository } from '../../../../domain/interfaces/repositories/repository.interface';
import { TResponseBookingData } from '../../../../domain/interfaces/model/hotel.interface';
import { formatDateString } from '../../../../utils/dateFormatter';

@injectable()
export class GetBookingsByUserUseCase implements IGetBookingsByUserUseCase {
  constructor(
    @inject(TOKENS.BookingRepository) private _bookingRepo: IBookingRepository
  ) { }

  async getBookingByUser(userId: string, page: number, limit: number): Promise<{ bookings: TResponseBookingData[], total: number }> {
    const { bookings, total } = await this._bookingRepo.findBookingsByUser(userId, page, limit);

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
