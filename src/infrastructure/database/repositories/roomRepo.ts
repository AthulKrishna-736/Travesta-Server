import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepo";
import { roomModel, TRoomDocument } from "../models/roomModel";
import { IRoom } from "../../../domain/interfaces/hotel.interface";
import { IRoomRepository } from "../../../domain/repositories/repository.interface";
import { CreateRoomDTO, UpdateRoomDTO } from "../../../interfaces/dtos/hotel.dto";

@injectable()
export class RoomRepository extends BaseRepository<TRoomDocument> implements IRoomRepository {
    constructor() {
        super(roomModel);
    }

    async createRoom(data: CreateRoomDTO): Promise<IRoom | null> {
        const room = await this.create(data);
        return room.toObject();
    }

    async findRoomById(id: string): Promise<IRoom | null> {
        const room = await this.findById(id);
        return room?.toObject() || null;
    }

    async updateRoom(id: string, data: UpdateRoomDTO): Promise<IRoom | null> {
        const room = await this.update(id, data);
        return room?.toObject() || null;
    }

    async deleteRoom(id: string): Promise<any> {
        const result = await this.delete(id);
        return result
    }

    async findRoomsByHotel(hotelId: string): Promise<IRoom[] | null> {
        const rooms = await this.find({ hotelId }).lean<IRoom[]>();
        return rooms;
    }

    async findAvailableRoomsByHotel(hotelId: string): Promise<IRoom[] | null> {
        const rooms = await this.find({ hotelId, isAvailable: true }).lean<IRoom[]>();
        return rooms;
    }
}
