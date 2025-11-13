import { injectable } from 'tsyringe';
import { BaseRepository } from './baseRepo';
import { bookingModel, TBookingDocument } from '../models/bookingModel';
import { IBooking, TCreateBookingData } from '../../../domain/interfaces/model/booking.interface';
import { IBookingRepository } from '../../../domain/interfaces/repositories/bookingRepo.interface';
import { hotelModel } from '../models/hotelModel';
import { roomModel } from '../models/roomModel';
import mongoose, { ClientSession, PipelineStage, Types } from 'mongoose';
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

    async createBookingIfAvailable(roomId: string, bookingData: TCreateBookingData, session: ClientSession): Promise<IBooking | null> {

        const room = await roomModel.findById(roomId).session(session);
        if (!room) throw new Error('Room not found');

        const bookedCount = await bookingModel.countDocuments({
            roomId,
            status: { $ne: 'cancelled' },
            checkIn: { $lt: bookingData.checkOut },
            checkOut: { $gt: bookingData.checkIn }
        }).session(session);

        if (bookedCount >= room.roomCount) {
            return null;
        }

        const [booking] = await bookingModel.create([bookingData], { session });
        return booking.toObject();
    }

    async findBookingsByUser(userId: string, page: number, limit: number, search?: string, sort?: string): Promise<{ bookings: IBooking[]; total: number }> {
        const skip = (page - 1) * limit;

        const filter: any = { userId };

        // ✅ search (match hotel name OR city OR state)
        if (search) {
            const searchRegex = new RegExp(search, "i");
            filter.$or = [
                { "hotelId.name": searchRegex },
                { "hotelId.city": searchRegex },
                { "hotelId.state": searchRegex },
            ];
        }

        // ✅ sort mapping
        let sortQuery: Record<string, 1 | -1> = { createdAt: -1 }; // default recent
        switch (sort) {
            case "recent":
                sortQuery = { createdAt: -1 };
                break;
            case "name_asc":
                sortQuery = { "roomId.name": 1 };
                break;
            case "name_desc":
                sortQuery = { "roomId.name": -1 };
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

        const total = await this.model.countDocuments(filter);

        const bookings = await this.model
            .find(filter)
            .sort(sortQuery)
            .skip(skip)
            .limit(limit)
            .populate({ path: "roomId", select: "name basePrice" })
            .populate({ path: "hotelId", select: "name state city images" })
            .lean<IBooking[]>();

        return { bookings, total };
    }


    async findBookingsByVendor(vendorId: string, page: number, limit: number, hotelId?: string, startDate?: string, endDate?: string): Promise<{ bookings: IBooking[]; total: number }> {
        const skip = (page - 1) * limit;
        const vendorHotels = await hotelModel.find({ vendorId }, { _id: 1 }).lean();
        const hotelIds = vendorHotels.map(h => h._id);

        if (!hotelIds.length) return { bookings: [], total: 0 };
        const filter: any = { hotelId: { $in: hotelIds } };

        if (hotelId) {
            filter.hotelId = hotelId;
        }

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            filter.$or = [
                { checkIn: { $gte: start, $lte: end } },
                { checkOut: { $gte: start, $lte: end } }
            ];
        }

        const total = await this.model.countDocuments(filter);
        const bookings = await this.model.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({ path: 'roomId', select: '_id name basePrice' })
            .populate({ path: 'hotelId', select: '_id name vendorId' })
            .populate({ path: 'userId', select: 'firstName lastName email phone' })
            .lean<IBooking[]>();

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

    async isRoomAvailable(roomId: string, checkIn: Date, checkOut: Date, session?: ClientSession): Promise<boolean> {
        const room = await roomModel.findById(roomId).session(session!);
        if (!room) throw new Error("Room not found");

        const bookedCount = await bookingModel.countDocuments({
            roomId,
            status: { $ne: "cancelled" },
            checkIn: { $lt: checkOut },
            checkOut: { $gt: checkIn },
        }).session(session!);

        return bookedCount < room.roomCount;
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
        const dateFilter: any = {};
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
        const dateFilter: any = {};
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
        const dateFilter: any = {};
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


    async findCustomRoomDates(roomId: string, limit: number): Promise<any> {
        // const 
    }

    async getBookedRoomsCount(roomId: string, checkIn: string, checkOut: string): Promise<number> {
        const startOfDay = new Date(checkIn);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(checkOut);
        endOfDay.setHours(23, 59, 59, 999);

        const count = await bookingModel.countDocuments({
            roomId: new Types.ObjectId(roomId),
            status: 'confirmed',
            $or: [
                { checkIn: { $lte: endOfDay }, checkOut: { $gte: startOfDay } }
            ]
        });

        return count;
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
}
