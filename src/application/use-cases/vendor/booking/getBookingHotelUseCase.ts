import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../../constants/token";
import { IBookingRepository } from "../../../../domain/interfaces/repositories/bookingRepo.interface";
import { IGetBookingsByHotelUseCase } from "../../../../domain/interfaces/model/booking.interface";
import { TResponseBookingDTO } from "../../../../interfaceAdapters/dtos/booking.dto";
import { ResponseMapper } from "../../../../utils/responseMapper";

@injectable()
export class GetBookingsByHotelUseCase implements IGetBookingsByHotelUseCase {
    constructor(
        @inject(TOKENS.BookingRepository) private _bookingRepository: IBookingRepository
    ) { }

    async getBookingsByHotel(hotelId: string, page: number, limit: number): Promise<{ bookings: TResponseBookingDTO[], total: number, message: string }> {
        const { bookings, total } = await this._bookingRepository.findBookingsByHotel(hotelId, page, limit);

        if (!bookings || bookings.length == 0 || total == 0) {
            return {
                bookings: [],
                total: 0,
                message: 'User have no bookings',
            }
        }

        const mappedBookings = bookings.map(ResponseMapper.mapBookingResponseToDTO);

        return {
            bookings: mappedBookings,
            total,
            message: 'Fetched booking by Hotel succefully'
        }
    }
}
