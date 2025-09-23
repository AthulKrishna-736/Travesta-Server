import { inject, injectable } from 'tsyringe';
import { AppError } from '../../../../utils/appError';
import { HttpStatusCode } from '../../../../constants/HttpStatusCodes';
import { TOKENS } from '../../../../constants/token';
import { IBookingRepository } from '../../../../domain/interfaces/repositories/bookingRepo.interface';
import { formatDateString } from '../../../../utils/dateFormatter';
import { ICreateBookingUseCase, TCreateBookingData, TResponseBookingData } from '../../../../domain/interfaces/model/booking.interface';
import { BOOKING_RES_MESSAGES } from '../../../../constants/resMessages';
import { BOOKING_ERROR_MESSAGES } from '../../../../constants/errorMessages';

@injectable()
export class CreateBookingUseCase implements ICreateBookingUseCase {
    constructor(
        @inject(TOKENS.BookingRepository) private _bookingRepository: IBookingRepository,
    ) { }

    async createBooking(data: TCreateBookingData): Promise<{ booking: TResponseBookingData; message: string }> {
        const isAvailable = await this._bookingRepository.isRoomAvailable(data.roomId as string, data.checkIn, data.checkOut);

        if (!isAvailable) {
            throw new AppError('Room is not available for selected dates', HttpStatusCode.BAD_REQUEST);
        }

        if (new Date(data.checkIn) < new Date()) {
            throw new AppError('Check-in date cannot be in the past', HttpStatusCode.BAD_REQUEST);
        }

        if (new Date(data.checkIn) >= new Date(data.checkOut)) {
            throw new AppError('Check-in date must be before check-out date', HttpStatusCode.BAD_REQUEST);
        }

        const created = await this._bookingRepository.createBooking(data);
        if (!created) {
            throw new AppError(BOOKING_ERROR_MESSAGES.createFail, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const mappedBook: TResponseBookingData = {
            ...created,
            checkIn: formatDateString(created.checkIn.toString()),
            checkOut: formatDateString(created.checkOut.toString()),
        };

        return {
            booking: mappedBook,
            message: BOOKING_RES_MESSAGES.create,
        };
    }
}
