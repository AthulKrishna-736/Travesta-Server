import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepo";
import { hotelModel, THotelDocument } from "../models/hotelModel";
import { IHotel, TCreateHotelData, TUpdateHotelData } from "../../../domain/interfaces/model/hotel.interface";
import { IHotelRepository } from "../../../domain/interfaces/repositories/repository.interface";

@injectable()
export class HotelRepository extends BaseRepository<THotelDocument> implements IHotelRepository {
    constructor() {
        super(hotelModel);
    }

    async createHotel(data: TCreateHotelData): Promise<IHotel | null> {
        const hotel = await this.create(data);
        return hotel.toObject();
    }

    async findHotelById(id: string): Promise<IHotel | null> {
        const hotel = await this.findById(id);
        return hotel?.toObject() || null;
    }

    async updateHotel(id: string, data: TUpdateHotelData): Promise<IHotel | null> {
        const hotel = await this.update(id, data);
        return hotel?.toObject() || null;
    }

    async findHotelsByVendor(vendorId: string): Promise<IHotel[] | null> {
        const hotels = await this.find({ vendorId }).lean<IHotel[]>();
        return hotels;
    }

    async findAllHotels(page: number, limit: number, search?: string): Promise<{ hotels: IHotel[] | null; total: number }> {
        const skip = (page - 1) * limit;
        const filter: any = {};

        if (search) {
            const regex = new RegExp(search, "i");
            filter.$or = [
                { name: regex },
                { city: regex },
                { state: regex }
            ];
        }

        const total = await this.model.countDocuments(filter);
        const hotels = await this.find(filter).skip(skip).limit(limit).lean<IHotel[]>();

        return { hotels, total };
    }
}
