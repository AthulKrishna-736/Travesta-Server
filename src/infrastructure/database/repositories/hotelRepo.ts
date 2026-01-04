import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepo";
import { hotelModel, THotelDocument } from "../models/hotelModel";
import { IHotel, TCreateHotelData, TUpdateHotelData } from "../../../domain/interfaces/model/hotel.interface";
import { IHotelRepository } from "../../../domain/interfaces/repositories/hotelRepo.interface";
import mongoose, { PipelineStage, QueryOptions } from "mongoose";
import { IRoom } from "../../../domain/interfaces/model/room.interface";

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
        const hotel = await this.model
            .findById(hotelId)
            .populate("amenities", "_id name")
        return hotel?.toObject() || null;
    }

    async findHotelBySlug(slug: string): Promise<IHotel | null> {
        const hotel = await this.model
            .findOne({ slug })
            .populate("amenities", "_id name");

        return hotel ? hotel.toObject() : null;
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
        const filter: QueryOptions = { vendorId };
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
        checkIn: string,
        checkOut: string,
        geoLocation: { long: number, lat: number },
        search?: string,
        hotelAmenities?: string[],
        roomAmenities?: string[],
        roomType?: string[],
        minPrice?: number,
        maxPrice?: number,
        rating?: number,
        sort?: string,
    ): Promise<{ hotels: Array<IHotel & { rooms: IRoom[], bookings: { _id: string, bookedRooms: number }[] }>, total: number }> {
        const skip = (page - 1) * limit;

        const hotelAmenitiesIds = hotelAmenities?.map(id => new mongoose.Types.ObjectId(id));
        const roomAmenitiesIds = roomAmenities?.map(id => new mongoose.Types.ObjectId(id));

        const hotelQuery: QueryOptions = { isBlocked: false };
        const roomQuery: QueryOptions = { isAvailable: true };

        //hotel query
        if (search) {
            const regex = new RegExp(search, 'i');
            hotelQuery.$or = [{ name: regex }, { city: regex }, { state: regex }];
        }

        if (hotelAmenities && hotelAmenities.length > 0) {
            hotelQuery.amenities = { $all: hotelAmenitiesIds };
        }

        //room query
        if (roomAmenities && roomAmenities.length > 0) {
            roomQuery.amenities = { $all: roomAmenitiesIds };
        }

        if (roomType && roomType.length > 0) {
            roomQuery.roomType = { $in: roomType };
        }

        if (minPrice !== undefined && maxPrice !== undefined) {
            roomQuery.basePrice = { $gte: minPrice, $lte: maxPrice };
        }

        //aggregation
        const pipeline: PipelineStage[] = [

            //geolocation based search
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [geoLocation.long, geoLocation.lat],
                    },
                    distanceField: "distance",
                    spherical: true,
                    maxDistance: 20000,
                }
            },

            //hotel query
            {
                $match: hotelQuery,
            },

            //build dates based on hotel timing
            {
                $addFields: {
                    hotelCheckIn: {
                        $dateFromString: {
                            dateString: { $concat: [checkIn, 'T', '$propertyRules.checkInTime'] }
                        }
                    },
                    hotelCheckOut: {
                        $dateFromString: {
                            dateString: { $concat: [checkOut, 'T', '$propertyRules.checkOutTime'] }
                        }
                    }
                }
            },

            //amenities collection lookup
            {
                $lookup: {
                    from: 'amenities',
                    localField: 'amenities',
                    foreignField: '_id',
                    as: 'amenities',
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                type: 1,
                            }
                        }
                    ]
                }
            },

            //booking collection lookup
            {
                $lookup: {
                    from: 'bookings',
                    let: {
                        hotelId: '$_id',
                        hCheckIn: '$hotelCheckIn',
                        hCheckOut: '$hotelCheckOut',
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$hotelId', '$$hotelId'] },
                                        { $eq: ['$status', 'confirmed'] },
                                        { $eq: ['$payment', 'success'] },
                                        { $lt: ['$checkIn', '$$hCheckOut'] },
                                        { $gt: ['$checkOut', '$$hCheckIn'] }
                                    ]
                                }
                            },
                        }, {
                            $group: {
                                _id: '$roomId',
                                bookedRooms: { $sum: '$roomsCount' },
                            }
                        },
                    ],
                    as: 'bookings',
                }
            },

            //rooms collection lookup
            {
                $lookup: {
                    from: 'rooms',
                    let: {
                        hotelId: '$_id',
                        bookings: '$booking',
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$hotelId', '$$hotelId'] },
                                ...roomQuery,
                            },
                        }
                    ],
                    as: 'rooms',
                }
            },
            {
                $match: {
                    $expr: { $gt: [{ $size: '$rooms' }, 0] }
                }
            },

            //lookup ratings
            {
                $lookup: {
                    from: "ratings",
                    let: { hotelId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$hotelId", "$$hotelId"] } } },
                        {
                            $group: {
                                _id: "$hotelId",
                                averageRating: {
                                    $avg: {
                                        $avg: [
                                            "$hospitality",
                                            "$cleanliness",
                                            "$facilities",
                                            "$room",
                                            "$moneyValue"
                                        ]
                                    }
                                },
                                totalRatings: { $sum: 1 }
                            }
                        }
                    ],
                    as: "ratingInfo"
                }
            },
            {
                $unwind: {
                    path: "$ratingInfo",
                    preserveNullAndEmptyArrays: true
                }
            },

            ...(rating !== undefined ? [{
                $match: {
                    $expr: { $gte: [{ $ifNull: ["$ratingInfo.averageRating", 0] }, rating] }
                }
            }] : []),

            {
                $addFields: {
                    averageRating: { $ifNull: ["$ratingInfo.averageRating", 0] },
                    totalRatings: { $ifNull: ["$ratingInfo.totalRatings", 0] }
                }
            },

            {
                $sort:
                    sort === "name_asc" ? { name: 1 } :
                        sort === "name_desc" ? { name: -1 } :
                            { createdAt: -1 }
            },
            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limit }
                    ],
                    count: [
                        { $count: "total" }
                    ]
                }
            }
        ];

        const result = await this.model.aggregate(pipeline);
        const hotels = result[0].data;
        const total = result[0].count.length > 0 ? result[0].count[0].total : 0;

        return { hotels, total };
    }

    async getTrendingHotels(checkIn: Date, checkOut: Date): Promise<any> {
        const hotels = await hotelModel.aggregate([
            { $match: { isBlocked: false } },

            {
                $lookup: {
                    from: "rooms",
                    localField: "_id",
                    foreignField: "hotelId",
                    as: "rooms"
                }
            },

            { $match: { "rooms.0": { $exists: true } } },

            { $unwind: "$rooms" },

            {
                $lookup: {
                    from: "bookings",
                    let: { roomId: "$rooms._id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$roomId", "$$roomId"] },
                                        { $ne: ["$status", "cancelled"] },

                                        // Overlap check:
                                        {
                                            $or: [
                                                {
                                                    $and: [
                                                        { $lte: ["$checkIn", checkOut] },
                                                        { $gte: ["$checkOut", checkIn] }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "roomBookings"
                }
            },

            { $match: { "roomBookings": { $size: 0 } } },

            {
                $group: {
                    _id: "$_id",
                    hotel: { $first: "$$ROOT" },
                    room: { $first: "$rooms" } // return only ONE available room
                }
            },

            { $sort: { "hotel.createdAt": -1 } },
            { $limit: 3 },

            {
                $project: {
                    _id: "$hotel._id",
                    name: "$hotel.name",
                    slug: "$hotel.slug",
                    images: "$hotel.images",
                    city: "$hotel.city",
                    state: "$hotel.state",
                    room: "$room"
                }
            }
        ]);

        return hotels;
    }

}