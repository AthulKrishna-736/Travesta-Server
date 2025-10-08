import { HotelEntity, IHotelEntity } from "../../../domain/entities/hotel.entity";
import { IHotelRepository } from "../../../domain/interfaces/repositories/hotelRepo.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";

interface IHotelBase {
    getHotelEntityByVendorId(vendorId: string, page: number, limit: number, search?: string): Promise<IHotelEntity[]>
    getHotelEntityById(hotelId: string): Promise<IHotelEntity>
}

export abstract class HotelLookupBase {
    constructor(protected readonly _hotelRepository: IHotelRepository) { }

    async getHotelEntityByVendorId(vendorId: string, page: number, limit: number, search?: string): Promise<IHotelEntity[]> {
        const { hotels, total } = await this._hotelRepository.findHotelsByVendor(vendorId, page, limit, search)

        if (!hotels || total === 0) return [];

        const hotelsEntity = hotels.map(h => new HotelEntity(h))

        return hotelsEntity;
    }

    async getHotelEntityById(hotelId: string): Promise<IHotelEntity> {
        const hotel = await this._hotelRepository.findHotelById(hotelId);

        if (!hotel) {
            throw new AppError('hotel does not exist with this id', HttpStatusCode.NOT_FOUND);
        }

        return new HotelEntity(hotel)
    }
}