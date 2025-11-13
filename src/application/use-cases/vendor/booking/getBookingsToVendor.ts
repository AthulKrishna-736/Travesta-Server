import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../../constants/token';
import { IBookingRepository } from '../../../../domain/interfaces/repositories/bookingRepo.interface';
import { formatDateString } from '../../../../utils/dateFormatter';
import { IGetBookingsToVendorUseCase, TResponseBookingData } from '../../../../domain/interfaces/model/booking.interface';

@injectable()
export class GetBookingsToVendorUseCase implements IGetBookingsToVendorUseCase {
    constructor(
        @inject(TOKENS.BookingRepository) private _bookingRepository: IBookingRepository
    ) { }

    async getBookingsToVendor(vendorId: string, page: number, limit: number, hotelId?: string, startDate?: string, endDate?: string): Promise<{ bookings: TResponseBookingData[], total: number }> {
        const { bookings, total } = await this._bookingRepository.findBookingsByVendor(vendorId, page, limit, hotelId, startDate, endDate);

        const mappedBookings = bookings.map(b => ({
            ...b,
            checkIn: formatDateString(b.checkIn.toString()),
            checkOut: formatDateString(b.checkOut.toString()),
        }));

        return {
            bookings: mappedBookings,
            total
        };
    }
}
