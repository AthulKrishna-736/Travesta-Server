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
            checkIn: string;
            checkOut: string;
            guests?: number;
            minPrice?: number,
            maxPrice?: number,
            sort?: string;
        }
    ): Promise<{ hotels: any[]; total: number }> {
        const skip = (page - 1) * limit;

        if (!filters.checkIn || !filters.checkOut) {
            throw new Error("Check-in and check-out dates are required");
        }

        const hotelAmenitiesIds = filters.hotelAmenities?.map(id => new mongoose.Types.ObjectId(id));
        const roomAmenitiesIds = filters.roomAmenities?.map(id => new mongoose.Types.ObjectId(id));

        const checkInDate = new Date(filters.checkIn);
        const checkOutDate = new Date(filters.checkOut);

        const hotelMatch: any = { isBlocked: false };
        if (filters.search) {
            const regex = new RegExp(filters.search, "i");
            hotelMatch.$or = [{ name: regex }, { city: regex }, { state: regex }];
        }
        if (hotelAmenitiesIds?.length) {
            hotelMatch.amenities = { $all: hotelAmenitiesIds };
        }

        const pipeline: any[] = [
            { $match: hotelMatch },

            // Lookup rooms
            {
                $lookup: {
                    from: "rooms",
                    localField: "_id",
                    foreignField: "hotelId",
                    as: "rooms",
                },
            },

            //Lookup amenities
            {
                $lookup: {
                    from: "amenities",
                    localField: "amenities",
                    foreignField: "_id",
                    as: "amenities",
                    pipeline: [{ $project: { _id: 1, name: 1 } }],
                },
            },

            // Lookup bookings
            {
                $lookup: {
                    from: "bookings",
                    let: { roomIds: "$rooms._id" },
                    pipeline: [
                        { $match: { status: { $ne: "cancelled" } } }
                    ],
                    as: "bookings",
                },
            },

            // Filter rooms that match filters AND have no overlapping bookings
            {
                $addFields: {
                    availableRooms: {
                        $filter: {
                            input: "$rooms",
                            as: "room",
                            cond: {
                                $and: [
                                    filters.roomType ? { $in: ["$$room.roomType", filters.roomType] } : true,
                                    roomAmenitiesIds?.length ? { $setIsSubset: [roomAmenitiesIds, "$$room.amenities"] } : true,
                                    filters.guests ? { $gte: ["$$room.guest", filters.guests] } : true,
                                    filters.minPrice ? { $gte: ["$$room.basePrice", filters.minPrice] } : true,
                                    filters.maxPrice ? { $lte: ["$$room.basePrice", filters.maxPrice] } : true,

                                    // ✅ Check if roomCount > number of overlapping bookings
                                    {
                                        $gt: [
                                            "$$room.roomCount",
                                            {
                                                $size: {
                                                    $filter: {
                                                        input: "$bookings",
                                                        as: "b",
                                                        cond: {
                                                            $and: [
                                                                { $eq: ["$$b.roomId", "$$room._id"] },
                                                                { $lt: [checkInDate, "$$b.checkOut"] },
                                                                { $gt: [checkOutDate, "$$b.checkIn"] },
                                                                { $ne: ["$$b.status", "cancelled"] }
                                                            ]
                                                        }
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                }
            },


            // Only keep hotels with at least one available room
            { $match: { "availableRooms.0": { $exists: true } } },

            // Pick cheapest room
            {
                $addFields: {
                    cheapestRoom: { $arrayElemAt: [{ $sortArray: { input: "$availableRooms", sortBy: { basePrice: 1 } } }, 0] },
                },
            },

            ...(filters.sort === "price_asc"
                ? [{ $sort: { "cheapestRoom.basePrice": 1 } }]
                : filters.sort === "price_desc"
                    ? [{ $sort: { "cheapestRoom.basePrice": -1 } }]
                    : filters.sort === "name_asc"
                        ? [{ $sort: { name: 1 } }]
                        : filters.sort === "name_desc"
                            ? [{ $sort: { name: -1 } }]
                            : [{ $sort: { createdAt: -1 } }]),
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
                    cheapestRoom: { _id: 1, name: 1, basePrice: 1, roomCount: 1 },
                },
            },
        ];

        const hotels = await hotelModel.aggregate(pipeline);
        const total = hotels.length;

        return { hotels, total };
    }
}

