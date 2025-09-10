import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepo";
import { hotelModel, THotelDocument } from "../models/hotelModel";
import { IHotel, TCreateHotelData, TUpdateHotelData } from "../../../domain/interfaces/model/hotel.interface";
import { IHotelRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { roomModel } from "../models/roomModel";

@injectable()
export class HotelRepository extends BaseRepository<THotelDocument> implements IHotelRepository {
    constructor() {
        super(hotelModel);
    }

    async createHotel(data: TCreateHotelData): Promise<IHotel | null> {
        const hotel = await this.create(data);
        return hotel.toObject();
    }

    async findHotelById(hotelId: string): Promise<IHotel | null> {
        const hotel = await this.findById(hotelId);
        return hotel?.toObject() || null;
    }

    async updateHotel(hotelId: string, data: TUpdateHotelData): Promise<IHotel | null> {
        const hotel = await this.update(hotelId, data);
        return hotel?.toObject() || null;
    }

    async findHotelByVendor(vendorId: string, hotelId: string): Promise<IHotel | null> {
        const hotel = await this.model.findOne({ vendorId: vendorId, _id: hotelId }).lean();
        return hotel;
    }

    async findHotelsByVendor(vendorId: string, page: number, limit: number, search?: string): Promise<{ hotels: IHotel[] | null, total: number }> {
        const skip = (page - 1) * limit;
        const filter: any = { vendorId };
        if (search) {
            const searchRegex = new RegExp('^' + search, 'i')
            filter.$or = [
                { name: searchRegex },
                { state: searchRegex },
            ]
        }
        const total = await this.model.countDocuments(filter);
        const hotels = await this.model
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .populate("amenities", "_id name")
            .limit(limit)
            .lean();

        return { hotels, total };
    }

    async findAllHotels(
        page: number,
        limit: number,
        filters: {
            search?: string;
            amenities?: string[];
            roomType?: string[];
            checkIn?: string;
            checkOut?: string;
            guests?: number;
            minPrice?: number;
            maxPrice?: number;
        } = {}
    ): Promise<{ hotels: IHotel[] | null; total: number }> {
        const skip = (page - 1) * limit;

        const hotelFilter: any = { isBlocked: false };
        const roomFilter: any = {};

        if (filters.search) {
            const regex = new RegExp(filters.search, "i");
            hotelFilter.$or = [
                { name: regex },
                { city: regex },
                { state: regex },
            ];
        }

        // Filter by hotel amenities
        if (filters.amenities?.length) {
            hotelFilter.amenities = { $all: filters.amenities };
        }

        // Filter by room type, guest count, price range
        if (filters.roomType?.length) roomFilter.roomType = { $in: filters.roomType };
        if (filters.guests) roomFilter.guest = { $gte: filters.guests };
        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            roomFilter.basePrice = {};
            if (filters.minPrice !== undefined) roomFilter.basePrice.$gte = filters.minPrice;
            if (filters.maxPrice !== undefined) roomFilter.basePrice.$lte = filters.maxPrice;
        }

        // Optionally: availability based on checkIn/checkOut can be handled in booking logic
        if (filters.checkIn && filters.checkOut) {
            roomFilter.isAvailable = true;
        }

        // First, find rooms that match the room filters
        const matchedRooms = await roomModel
            .find(roomFilter)
            .select("hotelId")
            .lean<{ hotelId: string }[]>();

        const hotelIds = matchedRooms.map(r => r.hotelId);

        if (filters.roomType || filters.guests || filters.minPrice || filters.maxPrice || (filters.checkIn && filters.checkOut)) {
            if (hotelIds.length === 0) {
                return { hotels: [], total: 0 };
            }
            hotelFilter._id = { $in: hotelIds };
        }

        // Add hotelIds to hotel filter if rooms are filtered
        if (hotelIds.length) hotelFilter._id = { $in: hotelIds };

        const total = await hotelModel.countDocuments(hotelFilter);

        const hotels = await hotelModel
            .find(hotelFilter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("amenities", "_id name")
            .lean<IHotel[]>();

        return { hotels, total };
    }
}

