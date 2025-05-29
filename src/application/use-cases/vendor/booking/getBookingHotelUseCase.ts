import { inject, injectable } from "tsyringe";
import { TResponseBookingData } from "../../../../domain/interfaces/model/hotel.interface";
import { IGetBookingsByHotelUseCase } from "../../../../domain/interfaces/model/usecases.interface";
import { TOKENS } from "../../../../constants/token";
import { IBookingRepository } from "../../../../domain/interfaces/repositories/repository.interface";

@injectable()
export class GetBookingsByHotelUseCase implements IGetBookingsByHotelUseCase {
    constructor(
        @inject(TOKENS.BookingRepository) private _bookingRepo: IBookingRepository
    ) { }

    async execute(hotelId: string): Promise<TResponseBookingData[]> {
        return this._bookingRepo.findBookingsByHotel(hotelId);
    }
}
