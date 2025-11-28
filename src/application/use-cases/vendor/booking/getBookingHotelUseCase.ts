import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../../constants/token";
import { IBookingRepository } from "../../../../domain/interfaces/repositories/bookingRepo.interface";
import { formatDateString } from "../../../../utils/helperFunctions";
import { IGetBookingsByHotelUseCase, TResponseBookingData } from "../../../../domain/interfaces/model/booking.interface";

@injectable()
export class GetBookingsByHotelUseCase implements IGetBookingsByHotelUseCase {
    constructor(
        @inject(TOKENS.BookingRepository) private _bookingRepository: IBookingRepository
    ) { }

    async getBookingsByHotel(hotelId: string, page: number, limit: number): Promise<{ bookings: TResponseBookingData[], total: number }> {
        const { bookings, total } = await this._bookingRepository.findBookingsByHotel(hotelId, page, limit);

        const mappedBooking = bookings.map(b => ({
            ...b,
            checkIn: formatDateString(b.checkIn.toString()),
            checkOut: formatDateString(b.checkOut.toString()),
        }));

        return {
            bookings: mappedBooking,
            total
        }
    }
}
