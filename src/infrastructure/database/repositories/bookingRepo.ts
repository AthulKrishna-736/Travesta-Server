import { injectable } from 'tsyringe';
import { BaseRepository } from './baseRepo';
import { bookingModel, TBookingDocument } from '../models/bookingModel';
import { IBooking } from '../../../domain/interfaces/model/hotel.interface';
import { IBookingRepository } from '../../../domain/interfaces/repositories/repository.interface';

@injectable()
export class BookingRepository extends BaseRepository<TBookingDocument> implements IBookingRepository {
    constructor() {
        super(bookingModel);
    }

    async createBooking(data: Partial<IBooking>): Promise<IBooking | null> {
        const booking = await this.create(data);
        return booking.toObject();
    }

    async findBookingsByUser(userId: string): Promise<IBooking[]> {
        return this.find({ userId }).lean<IBooking[]>();
    }

    async findBookingsByHotel(hotelId: string): Promise<IBooking[]> {
        return this.find({ hotelId }).lean<IBooking[]>();
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
        await this.model.findByIdAndUpdate(booking._id, booking).exec();
    }

}
