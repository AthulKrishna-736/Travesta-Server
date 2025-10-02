import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepo";
import { hotelModel, THotelDocument } from "../models/hotelModel";
import { IHotel, TCreateHotelData, TUpdateHotelData } from "../../../domain/interfaces/model/hotel.interface";
import { IHotelRepository } from "../../../domain/interfaces/repositories/hotelRepo.interface";
import mongoose from "mongoose";
import { bookingModel } from "../models/bookingModel";
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


    async getHotelAnalytics(hotelId: string, period: 'week' | 'month' | 'year'): Promise<any> {
        const hotelObjectId = new mongoose.Types.ObjectId(hotelId);

        // Calculate date range based on period
        const now = new Date();
        let startDate: Date;

        switch (period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        // 1. Key Metrics Aggregation
        const metricsAggregation = await bookingModel.aggregate([
            {
                $match: {
                    hotelId: hotelObjectId,
                    // createdAt: { $gte: startDate }
                }
            },
            {
                $facet: {
                    // Total Revenue (only confirmed bookings with success payment)
                    revenue: [
                        {
                            $match: {
                                status: 'confirmed',
                                payment: 'success'
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: '$totalPrice' }
                            }
                        }
                    ],
                    // Total Bookings Count
                    bookings: [
                        {
                            $count: 'total'
                        }
                    ],
                    // Bookings by Status
                    bookingsByStatus: [
                        {
                            $group: {
                                _id: '$status',
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    // Payment Status
                    paymentStatus: [
                        {
                            $group: {
                                _id: '$payment',
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    // Average Daily Rate
                    averageRate: [
                        {
                            $match: {
                                status: 'confirmed'
                            }
                        },
                        {
                            $addFields: {
                                nights: {
                                    $divide: [
                                        { $subtract: ['$checkOut', '$checkIn'] },
                                        1000 * 60 * 60 * 24
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                avgRate: {
                                    $avg: {
                                        $divide: ['$totalPrice', '$nights']
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        ]);

        // 2. Revenue Over Time (for chart)
        const revenueOverTime = await bookingModel.aggregate([
            {
                $match: {
                    hotelId: hotelObjectId,
                    createdAt: { $gte: startDate },
                    status: 'confirmed',
                    payment: 'success'
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: period === 'week' ? '%Y-%m-%d' : period === 'month' ? '%Y-%m-%d' : '%Y-%m',
                            date: '$createdAt'
                        }
                    },
                    revenue: { $sum: '$totalPrice' }
                }
            },
            {
                $sort: { _id: 1 }
            },
            {
                $project: {
                    date: '$_id',
                    revenue: 1,
                    _id: 0
                }
            }
        ]);

        // 3. Room Performance
        const roomPerformance = await bookingModel.aggregate([
            {
                $match: {
                    hotelId: hotelObjectId,
                    createdAt: { $gte: startDate },
                    status: 'confirmed'
                }
            },
            {
                $group: {
                    _id: '$roomId',
                    bookings: { $sum: 1 },
                    revenue: { $sum: '$totalPrice' }
                }
            },
            {
                $lookup: {
                    from: 'rooms',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'roomDetails'
                }
            },
            {
                $unwind: '$roomDetails'
            },
            {
                $addFields: {
                    // Calculate occupancy: (bookings / total days in period) * 100
                    occupancy: {
                        $multiply: [
                            {
                                $divide: [
                                    '$bookings',
                                    {
                                        $divide: [
                                            { $subtract: [now, startDate] },
                                            1000 * 60 * 60 * 24
                                        ]
                                    }
                                ]
                            },
                            100
                        ]
                    }
                }
            },
            {
                $project: {
                    roomId: '$_id',
                    name: '$roomDetails.name',
                    type: '$roomDetails.roomType',
                    bookings: 1,
                    revenue: 1,
                    occupancy: { $round: ['$occupancy', 2] },
                    _id: 0
                }
            },
            {
                $sort: { revenue: -1 }
            },
            {
                $limit: 5
            }
        ]);

        // 4. Calculate Previous Period Metrics for Change Percentage
        let previousStartDate: Date;
        const periodLength = now.getTime() - startDate.getTime();
        previousStartDate = new Date(startDate.getTime() - periodLength);

        const previousMetrics = await bookingModel.aggregate([
            {
                $match: {
                    hotelId: hotelObjectId,
                    createdAt: { $gte: previousStartDate, $lt: startDate }
                }
            },
            {
                $facet: {
                    revenue: [
                        {
                            $match: {
                                status: 'confirmed',
                                payment: 'success'
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: '$totalPrice' }
                            }
                        }
                    ],
                    bookings: [
                        {
                            $count: 'total'
                        }
                    ]
                }
            }
        ]);

        // Process metrics
        const metrics = metricsAggregation[0];
        const prevMetrics = previousMetrics[0];

        const currentRevenue = metrics.revenue[0]?.total || 0;
        const previousRevenue = prevMetrics.revenue[0]?.total || 0;
        const revenueChange = previousRevenue > 0
            ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
            : 0;

        const currentBookings = metrics.bookings[0]?.total || 0;
        const previousBookings = prevMetrics.bookings[0]?.total || 0;
        const bookingsChange = previousBookings > 0
            ? ((currentBookings - previousBookings) / previousBookings) * 100
            : 0;

        // Calculate occupancy rate
        const totalRooms = await roomModel.countDocuments({ hotelId: hotelObjectId });
        const daysInPeriod = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const totalRoomNights = totalRooms * daysInPeriod;

        const bookedNights = await bookingModel.aggregate([
            {
                $match: {
                    hotelId: hotelObjectId,
                    status: 'confirmed',
                    checkIn: { $lte: now },
                    checkOut: { $gte: startDate }
                }
            },
            {
                $addFields: {
                    nights: {
                        $divide: [
                            { $subtract: ['$checkOut', '$checkIn'] },
                            1000 * 60 * 60 * 24
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalNights: { $sum: '$nights' }
                }
            }
        ]);

        const occupancyRate = totalRoomNights > 0
            ? ((bookedNights[0]?.totalNights || 0) / totalRoomNights) * 100
            : 0;

        // Format response
        return {
            metrics: {
                revenue: {
                    value: currentRevenue,
                    change: parseFloat(revenueChange.toFixed(2))
                },
                bookings: {
                    value: currentBookings,
                    change: parseFloat(bookingsChange.toFixed(2))
                },
                occupancy: {
                    value: parseFloat(occupancyRate.toFixed(2)),
                    change: 0 // You can calculate this similarly if needed
                },
                averageRate: {
                    value: metrics.averageRate[0]?.avgRate || 0,
                    change: 0 // You can calculate this similarly if needed
                }
            },
            revenueData: revenueOverTime,
            bookingsStatus: metrics.bookingsByStatus.map((item: any) => ({
                name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
                value: item.count,
                color: item._id === 'confirmed'
                    ? 'hsl(var(--success))'
                    : item._id === 'pending'
                        ? 'hsl(var(--primary))'
                        : 'hsl(var(--destructive))'
            })),
            paymentStatus: metrics.paymentStatus.map((item: any) => ({
                status: item._id.charAt(0).toUpperCase() + item._id.slice(1),
                count: item.count,
                color: item._id === 'success'
                    ? 'hsl(var(--success))'
                    : item._id === 'pending'
                        ? 'hsl(var(--primary))'
                        : item._id === 'failed'
                            ? 'hsl(var(--destructive))'
                            : 'hsl(var(--muted-foreground))'
            })),
            roomPerformance: roomPerformance.map((room: any, index: number) => ({
                rank: index + 1,
                ...room
            }))
        };
    }
}

