import {  injectable } from "tsyringe";
import { BaseRepository } from "./baseRepo";
import { roomModel, TRoomDocument } from "../models/roomModel";
import { IRoom, TCreateRoomData, TUpdateRoomData } from "../../../domain/interfaces/model/room.interface";
import { IRoomRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { hotelModel } from "../models/hotelModel";
import { bookingModel } from "../models/bookingModel";

@injectable()
export class RoomRepository extends BaseRepository<TRoomDocument> implements IRoomRepository {
    constructor() {
        super(roomModel);
    }

    async createRoom(data: TCreateRoomData): Promise<IRoom | null> {
        const room = await this.create(data);
        return room.toObject();
    }

    async findRoomById(roomId: string): Promise<IRoom | null> {
        const room = await this.model.findById(roomId)
            .populate({ path: "hotelId", select: "name images rating city state address amenities tags", })
            .lean();

        return room || null;
    }

    async updateRoom(roomId: string, data: TUpdateRoomData): Promise<IRoom | null> {
        const room = await this.update(roomId, data);
        return room?.toObject() || null;
    }

    async deleteRoom(roomId: string): Promise<any> {
        const result = await this.delete(roomId);
        return result
    }

    async findRoomsByHotel(hotelId: string): Promise<IRoom[] | null> {
        const rooms = await this.find({ hotelId })
            .populate('hotelId')
            .populate('amenities')
            .lean<IRoom[]>();
        return rooms;
    }

    async findAvailableRoomsByHotel(hotelId: string): Promise<IRoom[] | null> {
        const rooms = await this.find({ hotelId, isAvailable: true }).lean<IRoom[]>();
        return rooms;
    }

    async findAllRooms(page: number, limit: number, search?: string): Promise<{ rooms: IRoom[]; total: number; }> {
        const skip = (page - 1) * limit;
        const filter: any = {};

        if (search) {
            const regex = new RegExp(search, 'i');
            filter.$or = [{ name: regex }, { bedType: regex }];
        }

        const total = await this.model.countDocuments(filter);
        const rooms = await this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

        return { rooms, total };
    }

    async findFilteredAvailableRooms(
        page: number,
        limit: number,
        minPrice?: number,
        maxPrice?: number,
        amenities?: string[],
        search?: string,
        destination?: string,  
        checkIn?: string,
        checkOut?: string,
        guests?: string
    ): Promise<{ rooms: IRoom[]; total: number }> {

        console.log('repo parameters: ', page, limit, minPrice, maxPrice, amenities, search, destination, checkIn, checkOut, guests);
        const skip = (page - 1) * limit;
        const filter: any = {
            isAvailable: true
        };

        // Basic search (name, bedType)
        if (search) {
            const regex = new RegExp(search, 'i');
            filter.$or = [
                { name: regex },
                { bedType: regex }
            ];
        }

        // Price range
        if (minPrice !== undefined && maxPrice !== undefined) {
            filter.basePrice = { $gte: minPrice, $lte: maxPrice };
        }

        // Amenities filter
        if (amenities && amenities.length > 0) {
            filter.amenities = { $in: amenities };
        }

        // Guests capacity
        if (guests) {
            const guestCount = parseInt(guests);
            if (!isNaN(guestCount)) {
                filter.capacity = { $gte: guestCount };
            }
        }

        // First: Get all hotel IDs that match destination (state)
        if (destination) {
            const matchedHotels = await hotelModel.find({ state: new RegExp(destination, "i") }).select("_id");
            const hotelIds = matchedHotels.map(h => h._id);
            filter.hotelId = { $in: hotelIds };
        }

        // Get all rooms matching base filters
        let rooms = await roomModel.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'amenities',
                select: 'name _id',
                match: { isActive: true }
            })
            .lean();

        // Total count for pagination
        const total = await roomModel.countDocuments(filter);

        // If date filtering is applied, remove rooms that are booked
        if (checkIn && checkOut) {
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);

            const roomIds = rooms.map(r => r._id);

            const bookedRooms = await bookingModel.find({
                roomId: { $in: roomIds },
                status: { $ne: "cancelled" }, // Exclude cancelled bookings
                $or: [
                    {
                        checkIn: { $lt: checkOutDate },
                        checkOut: { $gt: checkInDate }
                    }
                ]
            }).select("roomId");

            const bookedRoomIds = new Set(bookedRooms.map(b => b.roomId.toString()));

            // Filter out booked rooms
            rooms = rooms.filter(room => !bookedRoomIds.has(room._id.toString()));
        }

        return { rooms, total };
    }
}
