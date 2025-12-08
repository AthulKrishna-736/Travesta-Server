import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../../constants/token";
import { IBookingRepository } from "../../../../domain/interfaces/repositories/bookingRepo.interface";
import { IGetBookingsByHotelUseCase } from "../../../../domain/interfaces/model/booking.interface";
import { TResponseBookingDTO } from "../../../../interfaceAdapters/dtos/booking.dto";
import { AppError } from "../../../../utils/appError";
import { BOOKING_ERROR_MESSAGES } from "../../../../constants/errorMessages";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { ResponseMapper } from "../../../../utils/responseMapper";

@injectable()
export class GetBookingsByHotelUseCase implements IGetBookingsByHotelUseCase {
    constructor(
        @inject(TOKENS.BookingRepository) private _bookingRepository: IBookingRepository
    ) { }

    async getBookingsByHotel(hotelId: string, page: number, limit: number): Promise<{ bookings: TResponseBookingDTO[], total: number, message: string }> {
        const { bookings, total } = await this._bookingRepository.findBookingsByHotel(hotelId, page, limit);

        if (!bookings || bookings.length == 0 || total == 0) {
            throw new AppError(BOOKING_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        const mappedBookings = bookings.map(ResponseMapper.mapBookingResponseToDTO);

        return {
            bookings: mappedBookings,
            total,
            message: 'Fetched booking by Hotel succefully'
        }
    }
}
