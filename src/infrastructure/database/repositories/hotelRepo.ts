import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepo";
import { hotelModel, THotelDocument } from "../models/hotelModel";
import { IHotel, TCreateHotelData, TUpdateHotelData } from "../../../domain/interfaces/model/hotel.interface";
import { IHotelRepository } from "../../../domain/interfaces/repositories/hotelRepo.interface";
import mongoose from "mongoose";

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

    async findDuplicateHotels(hotelName: string): Promise<boolean> {
        const hotels = await this.model.countDocuments({ name: { $regex: `^${hotelName}$`, $options: 'i' } });
        return hotels > 0;
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
            hotelAmenities?: string[];
            roomAmenities?: string[];
            roomType?: string[];
            checkIn?: string;
            checkOut?: string;
            guests?: number;
            minPrice?: number;
            maxPrice?: number;
            sort?: string;
        } = {}
    ): Promise<{ hotels: any[]; total: number }> {
        const skip = (page - 1) * limit;

        const hotelAmenitiesIds = filters.hotelAmenities?.map(id => new mongoose.Types.ObjectId(id));
        const roomAmenitiesIds = filters.roomAmenities?.map(id => new mongoose.Types.ObjectId(id));

        // Base hotel filter
        const hotelMatch: any = { isBlocked: false };
        if (filters.search) {
            const regex = new RegExp(filters.search, "i");
            hotelMatch.$or = [{ name: regex }, { city: regex }, { state: regex }];
        }
        if (hotelAmenitiesIds?.length) {
            hotelMatch.amenities = { $all: hotelAmenitiesIds };
        }

        // Sorting
        let sortQuery: any = { createdAt: -1 };
        if (filters.sort === "price_asc") sortQuery = { startingPrice: 1 };
        if (filters.sort === "price_desc") sortQuery = { startingPrice: -1 };
        if (filters.sort === "name_asc") sortQuery = { name: 1 };
        if (filters.sort === "name_desc") sortQuery = { name: -1 };

        const pipeline: any[] = [
            { $match: hotelMatch },
            {
                $lookup: {
                    from: "rooms",
                    localField: "_id",
                    foreignField: "hotelId",
                    as: "rooms",
                },
            },
            {
                $lookup: {
                    from: "amenities",
                    localField: "amenities",
                    foreignField: "_id",
                    as: "amenities",
                    pipeline: [{ $project: { _id: 1, name: 1 } }],
                },
            },
            {
                $addFields: {
                    filteredRooms: {
                        $filter: {
                            input: "$rooms",
                            as: "room",
                            cond: {
                                $and: [
                                    filters.roomType ? { $in: ["$$room.roomType", filters.roomType] } : true,
                                    roomAmenitiesIds?.length
                                        ? { $setIsSubset: [roomAmenitiesIds, "$$room.amenities"] }
                                        : true,
                                    filters.guests ? { $gte: ["$$room.guest", filters.guests] } : true,
                                    filters.minPrice !== undefined ? { $gte: ["$$room.basePrice", filters.minPrice] } : true,
                                    filters.maxPrice !== undefined ? { $lte: ["$$room.basePrice", filters.maxPrice] } : true,
                                ],
                            },
                        },
                    },
                },
            },
            {
                $addFields: {
                    startingPrice: {
                        $cond: [
                            { $gt: [{ $size: "$filteredRooms" }, 0] },
                            { $min: "$filteredRooms.basePrice" },
                            null,
                        ],
                    },
                    cheapestRoom: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: "$filteredRooms",
                                    as: "room",
                                    cond: {
                                        $eq: ["$$room.basePrice", { $min: "$filteredRooms.basePrice" }],
                                    },
                                },
                            },
                            0,
                        ],
                    },
                },
            },
            { $match: { startingPrice: { $ne: null } } },
            { $sort: sortQuery },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    name: 1,
                    city: 1,
                    state: 1,
                    description: 1,
                    images: 1,
                    amenities: 1,
                    startingPrice: 1,
                    cheapestRoom: {
                        _id: 1,
                        name: 1,
                        basePrice: 1,
                    },
                },
            },
        ];

        const hotels = await hotelModel.aggregate(pipeline);
        const total = hotels.length;

        return { hotels, total };
    }
}

