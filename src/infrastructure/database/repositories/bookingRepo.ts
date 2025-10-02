import { injectable } from 'tsyringe';
import { BaseRepository } from './baseRepo';
import { bookingModel, TBookingDocument } from '../models/bookingModel';
import { IBooking } from '../../../domain/interfaces/model/booking.interface';
import { IBookingRepository } from '../../../domain/interfaces/repositories/bookingRepo.interface';
import { hotelModel } from '../models/hotelModel';
import { roomModel } from '../models/roomModel';
import mongoose, { Types } from 'mongoose';
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

    async createBooking(data: Partial<IBooking>): Promise<IBooking | null> {
        const booking = await this.create(data);
        return booking.toObject<IBooking>();
    }

    async findBookingsByUser(
        userId: string,
        page: number,
        limit: number,
        search?: string,
        sort?: string
    ): Promise<{ bookings: IBooking[]; total: number }> {
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
                sortQuery = { "hotelId.name": 1 };
                break;
            case "name_desc":
                sortQuery = { "hotelId.name": -1 };
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


    async findBookingsByVendor(vendorId: string, page: number, limit: number): Promise<{ bookings: IBooking[]; total: number }> {
        const skip = (page - 1) * limit;
        const vendorHotels = await hotelModel.find({ vendorId }, { _id: 1 }).lean();
        const hotelIds = vendorHotels.map(h => h._id);

        if (!hotelIds.length) return { bookings: [], total: 0 };
        const filter = { hotelId: { $in: hotelIds } };
        const total = await this.model.countDocuments(filter);
        const bookings = await this.model.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({ path: 'roomId', select: 'name basePrice' })
            .populate({ path: 'hotelId', select: 'name vendorId' })
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

    async isRoomAvailable(roomId: string, checkIn: Date, checkOut: Date): Promise<boolean> {
        const room = await roomModel.findById(roomId);
        if (!room) throw new Error("Room not found");

        const bookedCount = await bookingModel.countDocuments({
            roomId,
            status: { $ne: "cancelled" },
            checkIn: { $lt: checkOut },
            checkOut: { $gt: checkIn },
        });

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
