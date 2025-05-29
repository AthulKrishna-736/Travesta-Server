// createBookingUseCase.ts
import { inject, injectable } from 'tsyringe';
import { AppError } from '../../../../utils/appError';
import { HttpStatusCode } from '../../../../utils/HttpStatusCodes';
import { ICreateBookingUseCase } from '../../../../domain/interfaces/model/usecases.interface';
import { TOKENS } from '../../../../constants/token';
import { TCreateBookingData, TResponseBookingData } from '../../../../domain/interfaces/model/hotel.interface';
import { IBookingRepository } from '../../../../domain/interfaces/repositories/repository.interface';

@injectable()
export class CreateBookingUseCase implements ICreateBookingUseCase {
    constructor(
        @inject(TOKENS.BookingRepository) private _bookingRepo: IBookingRepository
    ) { }

    // Create booking only if room is available for requested dates
    async execute(data: TCreateBookingData): Promise<{ booking: TResponseBookingData; message: string }> {
        const isAvailable = await this._bookingRepo.isRoomAvailable(data.roomId as string, data.checkIn, data.checkOut);

        if (!isAvailable) {
            throw new AppError('Room is not available for selected dates', HttpStatusCode.BAD_REQUEST);
        }

        const created = await this._bookingRepo.createBooking(data);
        if (!created) {
            throw new AppError('Failed to create booking', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        return {
            booking: created,
            message: 'Booking created successfully',
        };
    }
}
