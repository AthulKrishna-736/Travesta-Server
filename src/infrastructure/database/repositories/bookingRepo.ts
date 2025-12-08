import { injectable } from 'tsyringe';
import { BaseRepository } from './baseRepo';
import { bookingModel, TBookingDocument } from '../models/bookingModel';
import { IBooking, TBookingPopulated, TCreateBookingData } from '../../../domain/interfaces/model/booking.interface';
import { IBookingRepository } from '../../../domain/interfaces/repositories/bookingRepo.interface';
import { hotelModel } from '../models/hotelModel';
import { roomModel } from '../models/roomModel';
import mongoose, { ClientSession, PipelineStage, QueryOptions, Types } from 'mongoose';
import { userModel } from '../models/userModels';

@injectable()
export class BookingRepository extends BaseRepository<TBookingDocument> implements IBookingRepository {
    constructor() {
        super(bookingModel);
    }

    private _getDateMatch(period: 'week' | 'month' | 'year', hotelId: string) {
        const now = new Date();
        const start = new Date();
        if (period === "week") start.setDate(now.getDate() - 7);
        if (period === "month") start.setMonth(now.getMonth() - 1);
        if (period === "year") start.setFullYear(now.getFullYear() - 1);

        return {
            hotelId: new mongoose.Types.ObjectId(hotelId),
            createdAt: { $gte: start, $lte: now }
        };
    }

    async createBooking(data: Partial<IBooking>, session?: ClientSession): Promise<IBooking> {
        const [booking] = await this.model.create([{ ...data }], { session });
        return booking.toObject();
    };

    async createBookingIfAvailable(roomId: string, bookingData: TCreateBookingData, session: mongoose.ClientSession): Promise<IBooking | null> {

        const room = await roomModel.findById(roomId).session(session);
        if (!room) throw new Error('Room not found');

        const bookedAggregation = await bookingModel.aggregate([
            {
                $match: {
                    roomId: new mongoose.Types.ObjectId(roomId),
                    status: { $ne: 'cancelled' },
                    checkIn: { $lt: bookingData.checkOut },
                    checkOut: { $gt: bookingData.checkIn }
                }
            },
            {
                $group: {
                    _id: null,
                    totalBookedRooms: { $sum: "$roomsCount" }
                }
            }
        ]).session(session);

        const bookedRooms = bookedAggregation[0]?.totalBookedRooms || 0;

        if (bookedRooms + bookingData.roomsCount > room.roomCount) {
            return null;
        }

        const [booking] = await bookingModel.create([bookingData], { session });
        return booking.toObject();
    }


    async findBookingsByUser(
        userId: string,
        page: number,
        limit: number,
        search?: string,
        sort?: string
    ): Promise<{ bookings: TBookingPopulated[]; total: number }> {
        const skip = (page - 1) * limit;

        const filter: QueryOptions = {};

        if (search) {
            const searchRegex = new RegExp(search, "i");
            filter.$or = [
                { name: searchRegex },
            ];
        }

        let sortQuery: Record<string, 1 | -1> = { createdAt: -1 };
        switch (sort) {
            case "recent":
                sortQuery = { createdAt: -1 };
                break;
            case "name_asc":
                sortQuery = { "room.name": 1 };
                break;
            case "name_desc":
                sortQuery = { "room.name": -1 };
                break;
            case "price_asc":
                sortQuery = { totalPrice: 1 };
                break;
            case "price_desc":
                sortQuery = { totalPrice: -1 };
                break;
            default:
                sortQuery = { createdAt: -1 };
        }

        const pipeline: PipelineStage[] = [
            {
                $match: {
                    $expr: {
                        $eq: [new Types.ObjectId(userId), '$userId']
                    }
                }
            },
            {
                $lookup: {
                    from: 'rooms',
                    foreignField: '_id',
                    localField: 'roomId',
                    pipeline: [
                        {
                            $match: { ...filter }
                        },
                        {
                            $project: {
                                name: 1,
                                basePrice: 1,
                                roomType: 1,
                            }
                        }
                    ],
                    as: 'room'
                }
            },
            { $unwind: '$room' },
            {
                $lookup: {
                    from: 'hotels',
                    foreignField: '_id',
                    localField: 'hotelId',
                    pipeline: [
                        {
                            $project: {
                                name: 1,
                                city: 1,
                                state: 1,
                                images: 1,
                                geoLocation: 1,
                            }
                        }
                    ],
                    as: 'hotel'
                }
            },
            { $unwind: '$hotel' },

            {
                $facet: {
                    totalBookings: [
                        { $count: 'total' }
                    ],
                    data: [
                        { $sort: sortQuery },
                        { $skip: skip },
                        { $limit: limit },
                    ]
                }
            }
        ]

        const result = await this.model.aggregate(pipeline);

        const bookings = result[0].data;
        const total = result[0].totalBookings[0]?.total ?? 0;

        return { bookings, total };
    }

    async findBookingsByVendor(
        vendorId: string,
        page: number,
        limit: number,
        hotelId?: string,
        startDate?: string,
        endDate?: string
    ): Promise<{ bookings: any[]; total: number }> {

        const skip = (page - 1) * limit;

        const matchStage: QueryOptions = {};

        // 1) Match only vendor hotels
        const vendorHotelIds = await hotelModel.find({ vendorId }, { _id: 1 }).lean();
        const hotelIds = vendorHotelIds.map(h => h._id);

        if (!hotelIds.length) return { bookings: [], total: 0 };

        matchStage.hotelId = { $in: hotelIds };

        // 2) Filter for specific hotel
        if (hotelId) {
            matchStage.hotelId = new Types.ObjectId(hotelId);
        }

        // 3) Date Range Filter
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            matchStage.$or = [
                { checkIn: { $gte: start, $lte: end } },
                { checkOut: { $gte: start, $lte: end } }
            ];
        }

        const pipeline: PipelineStage[] = [
            { $match: matchStage },

            // Populate room
            {
                $lookup: {
                    from: "rooms",
                    localField: "roomId",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                basePrice: 1,
                                roomType: 1
                            }
                        }
                    ],
                    as: "room"
                }
            },
            { $unwind: "$room" },

            // Populate hotel
            {
                $lookup: {
                    from: "hotels",
                    localField: "hotelId",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                city: 1,
                                state: 1,
                                vendorId: 1,
                                images: 1
                            }
                        }
                    ],
                    as: "hotel"
                }
            },
            { $unwind: "$hotel" },

            // Populate user
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $project: {
                                firstName: 1,
                                lastName: 1,
                                email: 1,
                                phone: 1,
                            }
                        }
                    ],
                    as: "user"
                }
            },
            { $unwind: "$user" },

            // Pagination + Total Count
            {
                $facet: {
                    total: [{ $count: "value" }],
                    data: [
                        { $sort: { createdAt: -1 } },
                        { $skip: skip },
                        { $limit: limit }
                    ]
                }
            }
        ];

        const result = await bookingModel.aggregate(pipeline);

        const total = result[0]?.total[0]?.value ?? 0;
        const bookings = result[0]?.data ?? [];

        return { bookings, total };
    }

    async findBookingsByHotel(hotelId: string, page: number, limit: number): Promise<{ bookings: IBooking[]; total: number }> {
        const skip = (page - 1) * limit;
        const filter = { hotelId };

        const total = await this.model.countDocuments(filter);
        const bookings = await this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean<IBooking[]>();

        return { bookings, total };
    }

    async hasActiveBooking(userId: string): Promise<boolean> {
        const user = await userModel.findById(userId).select('role').lean();
        if (!user) return false;

        if (user.role !== 'user') {
            return true;
        }

        const result = await this.model.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'confirmed', checkOut: { $gte: new Date() } } },
            { $count: "total" }
        ]);

        return result.length > 0 && result[0].total > 0;
    }

    async isRoomAvailable(
        roomId: string,
        rooms: number,
        checkIn: Date,
        checkOut: Date,
        session?: mongoose.ClientSession
    ): Promise<boolean> {
        const query = roomModel.findById(roomId);
        if (session) query.session(session);

        const room = await query;
        if (!room) throw new Error("Room not found");

        const bookedAggregation = bookingModel.aggregate([
            {
                $match: {
                    roomId: new mongoose.Types.ObjectId(roomId),
                    status: { $ne: "cancelled" },
                    checkIn: { $lt: checkOut },
                    checkOut: { $gt: checkIn },
                }
            },
            {
                $group: {
                    _id: null,
                    totalBookedRooms: { $sum: "$roomsCount" }
                }
            }
        ]);

        if (session) bookedAggregation.session(session);

        const bookedResult = await bookedAggregation.exec();
        const bookedRooms = bookedResult[0]?.totalBookedRooms || 0;

        const availableRooms = room.roomCount - bookedRooms;
        return availableRooms >= rooms;
    }

    async findByid(bookingId: string): Promise<IBooking | null> {
        return this.model.findById(bookingId)
            .populate({ path: 'hotelId', select: 'name vendorId' })
            .lean<IBooking>().exec();
    }

    async save(booking: IBooking): Promise<void> {
        const { _id, ...updateData } = booking;
        await this.model.findByIdAndUpdate(_id, updateData).exec();
    }

    async cancelBookingById(id: string): Promise<void> {
        await this.model.findByIdAndUpdate(
            id,
            {
                status: 'cancelled',
                payment: 'refunded',
            },
            { new: true }
        ).exec();
    }

    async confirmBookingPayment(bookingId: string): Promise<void> {
        await this.model.findByIdAndUpdate(
            bookingId,
            {
                $set: {
                    status: 'confirmed',
                    payment: 'success',
                },
            },
            { new: true }
        ).exec();
    }

    async getVendorAnalyticsSummary(vendorId: string, startDate?: string, endDate?: string): Promise<{ totalRevenue: number; totalBookings: number; averageBookingValue: number; activeHotels: number; }> {
        const dateFilter: QueryOptions = {};
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            dateFilter.createdAt = { $gte: start, $lte: end };
        }

        const pipeline = [
            {
                $lookup: {
                    from: 'hotels',
                    localField: 'hotelId',
                    foreignField: '_id',
                    as: 'hotel'
                }
            },
            { $unwind: '$hotel' },
            {
                $match: {
                    'hotel.vendorId': new Types.ObjectId(vendorId),
                    status: { $ne: 'cancelled' },
                    payment: 'success',
                    ...dateFilter
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalPrice' },
                    totalBookings: { $sum: 1 },
                    uniqueHotels: { $addToSet: '$hotelId' }
                }
            }
        ];

        const result = await this.model.aggregate(pipeline);

        if (result.length === 0) {
            return {
                totalRevenue: 0,
                totalBookings: 0,
                averageBookingValue: 0,
                activeHotels: 0
            };
        }

        const data = result[0];
        return {
            totalRevenue: data.totalRevenue || 0,
            totalBookings: data.totalBookings || 0,
            averageBookingValue: data.totalBookings > 0
                ? data.totalRevenue / data.totalBookings
                : 0,
            activeHotels: data.uniqueHotels?.length || 0
        };
    }

    async getVendorTopHotels(vendorId: string, limit: number = 5, startDate?: string, endDate?: string): Promise<Array<{ hotelId: string; hotelName: string; revenue: number; bookings: number; }>> {
        const dateFilter: QueryOptions = {};
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            dateFilter.createdAt = { $gte: start, $lte: end };
        }

        const pipeline: PipelineStage[] = [
            {
                $lookup: {
                    from: 'hotels',
                    localField: 'hotelId',
                    foreignField: '_id',
                    as: 'hotel'
                }
            },
            { $unwind: '$hotel' },
            {
                $match: {
                    'hotel.vendorId': new Types.ObjectId(vendorId),
                    status: { $ne: 'cancelled' },
                    payment: 'success',
                    ...dateFilter
                }
            },
            {
                $group: {
                    _id: '$hotelId',
                    hotelName: { $first: '$hotel.name' },
                    revenue: { $sum: '$totalPrice' },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: limit },
            {
                $project: {
                    _id: 0,
                    hotelId: { $toString: '$_id' },
                    hotelName: 1,
                    revenue: 1,
                    bookings: 1
                }
            }
        ];

        return await this.model.aggregate(pipeline);
    }

    async getVendorMonthlyRevenue(vendorId: string, startDate?: string, endDate?: string): Promise<Array<{ month: string; revenue: number; bookings: number; }>> {
        let start: Date;
        let end: Date;

        if (startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);
        } else {
            end = new Date();
            start = new Date(end.getFullYear(), end.getMonth() - 11, 1);
        }

        const pipeline: PipelineStage[] = [
            {
                $lookup: {
                    from: 'hotels',
                    localField: 'hotelId',
                    foreignField: '_id',
                    as: 'hotel'
                }
            },
            { $unwind: '$hotel' },
            {
                $match: {
                    'hotel.vendorId': new Types.ObjectId(vendorId),
                    status: { $ne: 'cancelled' },
                    payment: 'success',
                    createdAt: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$totalPrice' },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            {
                $project: {
                    _id: 0,
                    month: {
                        $dateToString: {
                            format: '%b',
                            date: {
                                $dateFromParts: {
                                    year: '$_id.year',
                                    month: '$_id.month'
                                }
                            }
                        }
                    },
                    revenue: 1,
                    bookings: 1
                }
            }
        ];

        return await this.model.aggregate(pipeline);
    }

    async getVendorBookingStatus(vendorId: string, startDate?: string, endDate?: string): Promise<Array<{ status: string; count: number; }>> {
        const dateFilter: QueryOptions = {};
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            dateFilter.createdAt = { $gte: start, $lte: end };
        }

        const pipeline = [
            {
                $lookup: {
                    from: 'hotels',
                    localField: 'hotelId',
                    foreignField: '_id',
                    as: 'hotel'
                }
            },
            { $unwind: '$hotel' },
            {
                $match: {
                    'hotel.vendorId': new Types.ObjectId(vendorId),
                    ...dateFilter
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    status: '$_id',
                    count: 1
                }
            }
        ];

        return await this.model.aggregate(pipeline);
    }

    async getBookedRoomsCount(roomId: string, checkIn: Date, checkOut: Date): Promise<number> {
        const aggregation = await bookingModel.aggregate([
            {
                $match: {
                    roomId: new mongoose.Types.ObjectId(roomId),
                    status: 'confirmed',
                    checkIn: { $lt: checkOut },
                    checkOut: { $gt: checkIn }
                }
            },
            {
                $group: {
                    _id: null,
                    totalBookedRooms: { $sum: "$roomsCount" }
                }
            }
        ]);

        return aggregation[0]?.totalBookedRooms || 0;
    }


    async getTotalRevenue(hotelId: string, period: 'week' | 'month' | 'year'): Promise<number> {
        const match = this._getDateMatch(period, hotelId);
        const result = await bookingModel.aggregate([
            { $match: { ...match, status: "confirmed", payment: "success" } },
            { $group: { _id: null, revenue: { $sum: "$totalPrice" } } }
        ]);
        return result[0]?.revenue || 0;
    }

    async getTotalBookings(hotelId: string, period: 'week' | 'month' | 'year'): Promise<any> {
        const match = this._getDateMatch(period, hotelId);
        return bookingModel.countDocuments(match);
    }

    async getBookingStatusBreakdown(hotelId: string, period: 'week' | 'month' | 'year'): Promise<any> {
        const match = this._getDateMatch(period, hotelId);
        return bookingModel.aggregate([
            { $match: match },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
    }

    async getPaymentStatusBreakdown(hotelId: string, period: 'week' | 'month' | 'year'): Promise<any> {
        const match = this._getDateMatch(period, hotelId);
        return bookingModel.aggregate([
            { $match: match },
            { $group: { _id: "$payment", count: { $sum: 1 } } }
        ]);
    }

    async getRevenueTrend(hotelId: string, period: 'week' | 'month' | 'year'): Promise<any> {
        const match = this._getDateMatch(period, hotelId);
        return bookingModel.aggregate([
            { $match: match },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$totalPrice" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);
    }

    //admin analytics
    private buildDateFilter(startDate?: string, endDate?: string) {
        if (!startDate || !endDate) return {};

        return {
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };
    }

    async getTotalVendorBookings(startDate?: string, endDate?: string): Promise<number> {
        const filter = this.buildDateFilter(startDate, endDate);

        return bookingModel.countDocuments(filter);
    }

    async getTotalVendorRevenue(startDate?: string, endDate?: string): Promise<any> {
        const filter = this.buildDateFilter(startDate, endDate);

        const result = await bookingModel.aggregate([
            { $match: { payment: "success", ...filter } },
            { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } }
        ]);

        return result[0]?.totalRevenue ?? 0;
    }

    async getBookingsChart(interval: "day" | "month", startDate?: string, endDate?: string): Promise<any> {
        const filter = this.buildDateFilter(startDate, endDate);

        return bookingModel.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: interval === "day"
                        ? { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
                        : { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
    }

    async getTopHotels(limit = 5, startDate?: string, endDate?: string): Promise<any> {
        const filter = this.buildDateFilter(startDate, endDate);

        return bookingModel.aggregate([
            { $match: filter },

            {
                $group: {
                    _id: "$hotelId",
                    totalBookings: { $sum: 1 },
                    revenue: { $sum: "$totalPrice" }
                }
            },
            { $sort: { totalBookings: -1 } },
            { $limit: limit },

            // hotel data
            {
                $lookup: {
                    from: "hotels",
                    localField: "_id",
                    foreignField: "_id",
                    as: "hotel"
                }
            },
            { $unwind: "$hotel" },

            // add average rating
            {
                $lookup: {
                    from: "ratings",
                    localField: "_id",
                    foreignField: "hotelId",
                    as: "ratings"
                }
            },
            {
                $addFields: {
                    avgRating: { $avg: "$ratings.room" }
                }
            },

            {
                $project: {
                    _id: 1,
                    totalBookings: 1,
                    revenue: 1,
                    avgRating: 1,
                    hotel: {
                        name: 1,
                        city: 1,
                        images: 1,
                        vendorId: 1,
                    }
                }
            }
        ]);
    }

    async getTopVendors(limit = 5, startDate?: string, endDate?: string): Promise<any> {
        const filter = this.buildDateFilter(startDate, endDate);

        return bookingModel.aggregate([
            { $match: filter },

            // Join hotel → vendor
            {
                $lookup: {
                    from: "hotels",
                    localField: "hotelId",
                    foreignField: "_id",
                    as: "hotel"
                }
            },
            { $unwind: "$hotel" },

            // Aggregate by vendor
            {
                $group: {
                    _id: "$hotel.vendorId",
                    totalBookings: { $sum: 1 },
                    revenue: { $sum: "$totalPrice" },
                    hotelCount: { $addToSet: "$hotelId" }
                }
            },
            {
                $project: {
                    _id: 1,
                    totalBookings: 1,
                    revenue: 1,
                    hotelCount: { $size: "$hotelCount" }
                }
            },
            { $sort: { totalBookings: -1 } },
            { $limit: limit },

            // join vendor data
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "vendor"
                }
            },
            { $unwind: "$vendor" },

            {
                $project: {
                    vendor: {
                        firstName: 1,
                        lastName: 1,
                        email: 1,
                    },
                    totalBookings: 1,
                    hotelCount: 1,
                    revenue: 1,
                }
            }
        ]);
    }

    async getCounts(): Promise<any> {
        return {
            totalHotels: await hotelModel.countDocuments(),
            totalRooms: await roomModel.countDocuments(),
            totalBookings: await bookingModel.countDocuments(),
        };
    }

    async getTopRevenueDays(limit = 5, startDate?: string, endDate?: string): Promise<any> {
        const filter = this.buildDateFilter(startDate, endDate);

        return bookingModel.aggregate([
            { $match: { payment: "success", ...filter } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$totalPrice" }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: limit }
        ]);
    }
}
