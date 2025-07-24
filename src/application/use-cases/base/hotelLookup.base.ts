import { HotelEntity, IHotelEntity } from "../../../domain/entities/hotel.entity";
import { IHotelRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";


export abstract class HotelLookupBase {
    constructor(protected readonly _hotelRepo: IHotelRepository) { }

    protected async getHotelEntityByVendorId(vendorId: string): Promise<IHotelEntity[]> {
        const hotel = await this._hotelRepo.findHotelsByVendor(vendorId)

        if (!hotel || hotel.length === 0) return [];

        const hotels = hotel.map(h => new HotelEntity(h))

        return hotels
    }

    protected async getHotelEntityById(hotelId: string): Promise<IHotelEntity> {
        const hotel = await this._hotelRepo.findHotelById(hotelId);

        if (!hotel) {
            throw new AppError('hotel does not exist with this id', HttpStatusCode.NOT_FOUND);
        }

        return new HotelEntity(hotel)
    }

    protected async getAllHotels(page: number, limit: number, search?: string): Promise<{ hotels: IHotelEntity[], total: number }> {
        const { hotels, total } = await this._hotelRepo.findAllHotels(page, limit, search);

        if (!hotels || hotels.length == 0) {
            throw new AppError('No hotels found', HttpStatusCode.NOT_FOUND);
        }

        const hotelEntities = hotels.map(h => new HotelEntity(h))

        return { hotels: hotelEntities, total }
    }
}