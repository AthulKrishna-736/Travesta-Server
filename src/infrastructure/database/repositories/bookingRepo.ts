import { injectable } from 'tsyringe';
import { BaseRepository } from './baseRepo';
import { bookingModel, TBookingDocument } from '../models/bookingModel';
import { IBooking } from '../../../domain/interfaces/model/booking.interface';
import { IBookingRepository } from '../../../domain/interfaces/repositories/repository.interface';
import { hotelModel } from '../models/hotelModel';

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
            .populate({ path: 'hotelId', select: 'name' })
            .lean<IBooking[]>();

        return { bookings, total };
    }

    async findBookingsByVendor(vendorId: string, page: number, limit: number): Promise<{ bookings: IBooking[]; total: number }> {
        const skip = (page - 1) * limit;

        // Step 1: Find hotel IDs for this vendor
        const vendorHotels = await hotelModel.find({ vendorId }, { _id: 1 }).lean();
        const hotelIds = vendorHotels.map(h => h._id);

        if (!hotelIds.length) return { bookings: [], total: 0 };

        // Step 2: Filter bookings by those hotel IDs
        const filter = { hotelId: { $in: hotelIds } };

        // Step 3: Count total
        const total = await this.model.countDocuments(filter);

        // Step 4: Fetch bookings with hotel and room populated
        const bookings = await this.model.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({ path: 'roomId', select: 'name basePrice' })
            .populate({ path: 'hotelId', select: 'name vendorId' })
            .populate({ path: 'userId', select: 'firstName lastName' })
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


    async isRoomAvailable(roomId: string, checkIn: Date, checkOut: Date): Promise<boolean> {
        const overlappingBookings = await this.model.findOne({
            roomId,
            status: { $ne: 'cancelled' },
            $or: [
                { checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } },
            ],
        });
        return !overlappingBookings;
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
                'payment.status': 'refunded',
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
                    'payment.status': 'success',
                },
            },
            { new: true }
        ).exec();
    }
}
