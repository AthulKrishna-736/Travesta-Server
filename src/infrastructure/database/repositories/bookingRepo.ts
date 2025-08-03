import { injectable } from 'tsyringe';
import { BaseRepository } from './baseRepo';
import { bookingModel, TBookingDocument } from '../models/bookingModel';
import { IBooking } from '../../../domain/interfaces/model/booking.interface';
import { IBookingRepository } from '../../../domain/interfaces/repositories/repository.interface';

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

    async findByid(id: string): Promise<IBooking | null> {
        return this.model.findById(id).lean<IBooking>().exec();
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

}
