import { injectable } from 'tsyringe';
import { BaseRepository } from './baseRepo';
import { bookingModel, TBookingDocument } from '../models/bookingModel';
import { IBooking } from '../../../domain/interfaces/model/booking.interface';
import { IBookingRepository } from '../../../domain/interfaces/repositories/repository.interface';
import { hotelModel } from '../models/hotelModel';
import { roomModel } from '../models/roomModel';
import mongoose from 'mongoose';
import { userModel } from '../models/userModels';

@injectable()
export class BookingRepository extends BaseRepository<TBookingDocument> implements IBookingRepository {
    constructor() {
        super(bookingModel);
    }

    async createBooking(data: Partial<IBooking>): Promise<IBooking | null> {
        const booking = await this.create(data);
        return booking.toObject<IBooking>();
    }

    async findBookingsByUser(userId: string, page: number, limit: number): Promise<{ bookings: IBooking[]; total: number }> {
        const skip = (page - 1) * limit;
        const filter = { userId };

        const total = await this.model.countDocuments(filter);
        const bookings = await this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
            .populate({ path: 'roomId', select: 'name basePrice' })
            .populate({ path: 'hotelId', select: 'name state city images' })
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
}
