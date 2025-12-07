import { inject, injectable } from 'tsyringe';
import { AppError } from '../../../../utils/appError';
import { HttpStatusCode } from '../../../../constants/HttpStatusCodes';
import { TOKENS } from '../../../../constants/token';
import { IBookingRepository } from '../../../../domain/interfaces/repositories/bookingRepo.interface';
import { ICreateBookingUseCase } from '../../../../domain/interfaces/model/booking.interface';
import { BOOKING_RES_MESSAGES } from '../../../../constants/resMessages';
import { BOOKING_ERROR_MESSAGES } from '../../../../constants/errorMessages';
import { ClientSession } from 'mongoose';
import { TCreateBookingDTO, TResponseBookingDTO } from '../../../../interfaceAdapters/dtos/booking.dto';
import { ResponseMapper } from '../../../../utils/responseMapper';

@injectable()
export class CreateBookingUseCase implements ICreateBookingUseCase {
    constructor(
        @inject(TOKENS.BookingRepository) private _bookingRepository: IBookingRepository,
    ) { }

    async createBooking(data: TCreateBookingDTO, session: ClientSession): Promise<{ booking: TResponseBookingDTO; message: string }> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(data.checkIn) < today) {
            throw new AppError('Check-in date cannot be in the past', HttpStatusCode.BAD_REQUEST);
        }

        if (new Date(data.checkIn) >= new Date(data.checkOut)) {
            throw new AppError('Check-in date must be before check-out date', HttpStatusCode.BAD_REQUEST);
        }

        const created = await this._bookingRepository.createBookingIfAvailable(data.roomId as string, data, session);
        if (!created) {
            throw new AppError(BOOKING_ERROR_MESSAGES.createFail, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const mappedBooking = ResponseMapper.mapBookingResponseToDTO(created);

        return {
            booking: mappedBooking,
            message: BOOKING_RES_MESSAGES.create,
        };
    }
}
