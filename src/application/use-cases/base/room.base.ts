import { IRoomRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { IRoomEntity } from "../../../domain/entities/room.entity";
import { RoomEntity } from "../../../domain/entities/room.entity";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";

export abstract class RoomLookupBase {
    constructor(protected readonly _roomRepo: IRoomRepository) { }

    protected async getRoomEntityById(roomId: string): Promise<IRoomEntity> {
        const room = await this._roomRepo.findRoomById(roomId);

        if (!room) {
            throw new AppError("Room does not exist with this id", HttpStatusCode.NOT_FOUND);
        }

        return new RoomEntity(room);
    }

    protected async getRoomsEntityByHotelId(hotelId: string): Promise<IRoomEntity[]> {
        const rooms = await this._roomRepo.findRoomsByHotel(hotelId);

        if (!rooms || rooms.length === 0) {
            throw new AppError("No rooms found for this hotel", HttpStatusCode.NOT_FOUND);
        }

        return rooms.map((room) => new RoomEntity(room));
    }

    protected async getAvailableRoomsByHotelId(hotelId: string): Promise<IRoomEntity[]> {
        const rooms = await this._roomRepo.findAvailableRoomsByHotel(hotelId);

        if (!rooms || rooms.length === 0) {
            throw new AppError("No available rooms found for this hotel", HttpStatusCode.NOT_FOUND);
        }

        return rooms.map((room) => new RoomEntity(room));
    }

    protected async getAllRoomsOrThrow(page: number, limit: number, search?: string): Promise<{ rooms: IRoomEntity[], total: number }> {
        const { rooms, total } = await this._roomRepo.findAllRooms(page, limit, search);

        if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
            throw new AppError("No rooms found", HttpStatusCode.NOT_FOUND);
        }

        const roomEntities = rooms.map((r) => new RoomEntity(r));

        return { rooms: roomEntities, total };
    }

    protected async getFilteredAvailableRoomsOrThrow(page: number, limit: number, minPrice?: number, maxPrice?: number, amenities?: string[], search?: string): Promise<{ rooms: IRoomEntity[], total: number }> {
        const { rooms, total } = await this._roomRepo.findFilteredAvailableRooms(page, limit, minPrice, maxPrice, amenities, search);

        if (!rooms || rooms.length === 0) {
            throw new AppError("No available rooms found", HttpStatusCode.NOT_FOUND);
        }

        const roomEntities = rooms.map((r) => new RoomEntity(r));
        return { rooms: roomEntities, total };
    }

}
