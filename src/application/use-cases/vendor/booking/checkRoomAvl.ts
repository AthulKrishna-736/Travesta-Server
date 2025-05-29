// checkRoomAvailabilityUseCase.ts
import { inject, injectable } from 'tsyringe';
import { ICheckRoomAvailabilityUseCase } from '../../../../domain/interfaces/model/usecases.interface';
import { TOKENS } from '../../../../constants/token';
import { IBookingRepository } from '../../../../domain/interfaces/repositories/repository.interface';

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
