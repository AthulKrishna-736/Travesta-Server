import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../../constants/token';
import { IBookingRepository } from '../../../../domain/interfaces/repositories/repository.interface';
import { ICheckRoomAvailabilityUseCase } from '../../../../domain/interfaces/model/booking.interface';

@injectable()
export class CheckRoomAvailabilityUseCase implements ICheckRoomAvailabilityUseCase {
    constructor(
        @inject(TOKENS.BookingRepository) private _bookingRepo: IBookingRepository
    ) { }

    // Simple availability check
    async execute(roomId: string, checkIn: Date, checkOut: Date): Promise<boolean> {
        return this._bookingRepo.isRoomAvailable(roomId, checkIn, checkOut);
    }
}
