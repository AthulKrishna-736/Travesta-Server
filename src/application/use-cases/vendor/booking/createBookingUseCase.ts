import { inject, injectable } from 'tsyringe';
import { AppError } from '../../../../utils/appError';
import { HttpStatusCode } from '../../../../constants/HttpStatusCodes';
import { TOKENS } from '../../../../constants/token';
import { IBookingRepository } from '../../../../domain/interfaces/repositories/bookingRepo.interface';
import { formatDateString } from '../../../../utils/dateFormatter';
import { ICreateBookingUseCase, TCreateBookingData, TResponseBookingData } from '../../../../domain/interfaces/model/booking.interface';
import { BOOKING_RES_MESSAGES } from '../../../../constants/resMessages';
import { BOOKING_ERROR_MESSAGES } from '../../../../constants/errorMessages';
import { ClientSession } from 'mongoose';

@injectable()
export class CreateBookingUseCase implements ICreateBookingUseCase {
    constructor(
        @inject(TOKENS.BookingRepository) private _bookingRepository: IBookingRepository,
    ) { }

    async createBooking(data: TCreateBookingData, session: ClientSession): Promise<{ booking: TResponseBookingData; message: string }> {
        if (new Date(data.checkIn) < new Date()) {
            throw new AppError('Check-in date cannot be in the past', HttpStatusCode.BAD_REQUEST);
        }

        if (new Date(data.checkIn) >= new Date(data.checkOut)) {
            throw new AppError('Check-in date must be before check-out date', HttpStatusCode.BAD_REQUEST);
        }

        const created = await this._bookingRepository.createBookingIfAvailable(data.roomId as string, data, session);
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
