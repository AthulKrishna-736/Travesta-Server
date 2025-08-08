import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../../constants/token';
import { IBookingRepository } from '../../../../domain/interfaces/repositories/repository.interface';
import { formatDateString } from '../../../../utils/dateFormatter';
import { IGetBookingsToVendorUseCase, TResponseBookingData } from '../../../../domain/interfaces/model/booking.interface';

@injectable()
export class GetBookingsToVendorUseCase implements IGetBookingsToVendorUseCase {
    constructor(
        @inject(TOKENS.BookingRepository) private _bookingRepo: IBookingRepository
    ) { }

    async getBookingsToVendor(vendorId: string, page: number, limit: number): Promise<{ bookings: TResponseBookingData[], total: number }> {
        const { bookings, total } = await this._bookingRepo.findBookingsByVendor(vendorId, page, limit);

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
