import { inject, injectable } from "tsyringe";
import { TResponseBookingData } from "../../../../domain/interfaces/model/hotel.interface";
import { IGetBookingsByHotelUseCase } from "../../../../domain/interfaces/model/usecases.interface";
import { TOKENS } from "../../../../constants/token";
import { IBookingRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { formatDateString } from "../../../../utils/dateFormatter";

@injectable()
export class GetBookingsByHotelUseCase implements IGetBookingsByHotelUseCase {
    constructor(
        @inject(TOKENS.BookingRepository) private _bookingRepo: IBookingRepository
    ) { }

    async getBookingsByHotel(hotelId: string, page: number, limit: number): Promise<{ bookings: TResponseBookingData[], total: number }> {
        const { bookings, total } = await this._bookingRepo.findBookingsByHotel(hotelId, page, limit);

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
