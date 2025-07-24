import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepo";
import { roomModel, TRoomDocument } from "../models/roomModel";
import { IRoom, TCreateRoomData, TUpdateRoomData } from "../../../domain/interfaces/model/room.interface";
import { IRoomRepository } from "../../../domain/interfaces/repositories/repository.interface";

@injectable()
export class RoomRepository extends BaseRepository<TRoomDocument> implements IRoomRepository {
    constructor() {
        super(roomModel);
    }

    async createRoom(data: TCreateRoomData): Promise<IRoom | null> {
        const room = await this.create(data);
        return room.toObject();
    }

    async findRoomById(id: string): Promise<IRoom | null> {
        const room = await this.model.findById(id)
            .populate({ path: "hotelId", select: "name images rating city state address amenities tags", })
            .lean();

        return room || null;
    }

    async updateRoom(id: string, data: TUpdateRoomData): Promise<IRoom | null> {
        const room = await this.update(id, data);
        return room?.toObject() || null;
    }

    async deleteRoom(id: string): Promise<any> {
        const result = await this.delete(id);
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

    async findFilteredAvailableRooms(page: number, limit: number, minPrice?: number, maxPrice?: number, amenities?: string[], search?: string): Promise<{ rooms: IRoom[]; total: number }> {
        const skip = (page - 1) * limit;

        const filter: any = {
            isAvailable: true,
        };

        if (search) {
            const regex = new RegExp(search, 'i');
            filter.$or = [
                { name: regex },
                { bedType: regex },
            ];
        }

        if (minPrice !== undefined && maxPrice !== undefined) {
            filter.basePrice = { $gte: minPrice, $lte: maxPrice };
        }

        if (amenities && amenities.length > 0) {
            filter.amenities = { $in: amenities };
        }

        const total = await this.model.countDocuments(filter);
        const rooms = await this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

        return { rooms, total };
    }

}
