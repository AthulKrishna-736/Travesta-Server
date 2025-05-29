// getBookingsByUserUseCase.ts
import { inject, injectable } from 'tsyringe';
import { TResponseBookingData } from '../../../../domain/interfaces/model/hotel.interface';
import { TOKENS } from '../../../../constants/token';
import { IGetBookingsByUserUseCase } from '../../../../domain/interfaces/model/usecases.interface';
import { IBookingRepository } from '../../../../domain/interfaces/repositories/repository.interface';

@injectable()
export class GetBookingsByUserUseCase implements IGetBookingsByUserUseCase {
  constructor(
    @inject(TOKENS.BookingRepository) private _bookingRepo: IBookingRepository
  ) { }

  async execute(userId: string): Promise<TResponseBookingData[]> {
    return this._bookingRepo.findBookingsByUser(userId);
  }
}
