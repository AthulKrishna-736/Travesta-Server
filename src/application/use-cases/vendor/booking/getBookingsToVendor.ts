import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../../constants/token';
import { IBookingRepository } from '../../../../domain/interfaces/repositories/bookingRepo.interface';
import { IGetBookingsToVendorUseCase } from '../../../../domain/interfaces/model/booking.interface';
import { TResponseBookingDTO } from '../../../../interfaceAdapters/dtos/booking.dto';
import { BOOKING_ERROR_MESSAGES } from '../../../../constants/errorMessages';
import { HttpStatusCode } from '../../../../constants/HttpStatusCodes';
import { ResponseMapper } from '../../../../utils/responseMapper';
import { AppError } from '../../../../utils/appError';

@injectable()
export class GetBookingsToVendorUseCase implements IGetBookingsToVendorUseCase {
    constructor(
        @inject(TOKENS.BookingRepository) private _bookingRepository: IBookingRepository
    ) { }

    async getBookingsToVendor(
        vendorId: string,
        page: number,
        limit: number,
        hotelId?: string,
        startDate?: string,
        endDate?: string
    ): Promise<{ bookings: TResponseBookingDTO[], total: number, message: string }> {
        const { bookings, total } = await this._bookingRepository.findBookingsByVendor(vendorId, page, limit, hotelId, startDate, endDate);

        if (!bookings || bookings.length == 0 || total == 0) {
            throw new AppError(BOOKING_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        const mappedBookings = bookings.map(ResponseMapper.mapBookingResponseToDTO);

        return {
            bookings: mappedBookings,
            total,
            message: 'Fetched Booking to vendor Successfully'
        };
    }
}
