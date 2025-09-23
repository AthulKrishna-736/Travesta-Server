import { IRoomRepository } from "../../../domain/interfaces/repositories/roomRepo.interface";
import { IRoomEntity } from "../../../domain/entities/room.entity";
import { RoomEntity } from "../../../domain/entities/room.entity";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";

export abstract class RoomLookupBase {
    constructor(protected readonly _roomRepository: IRoomRepository) { }

    protected async getRoomEntityById(roomId: string): Promise<IRoomEntity> {
        const room = await this._roomRepository.findRoomById(roomId);

        if (!room) {
            throw new AppError("Room does not exist with this id", HttpStatusCode.NOT_FOUND);
        }

        return new RoomEntity(room);
    }

    protected async getRoomsEntityByHotelId(hotelId: string): Promise<IRoomEntity[]> {
        const rooms = await this._roomRepository.findRoomsByHotel(hotelId);

        if (!rooms || rooms.length === 0) {
            throw new AppError("No rooms found for this hotel", HttpStatusCode.NOT_FOUND);
        }

        return rooms.map((room) => new RoomEntity(room));
    }

    protected async getAvailableRoomsByHotelId(hotelId: string): Promise<IRoomEntity[]> {
        const rooms = await this._roomRepository.findAvailableRoomsByHotel(hotelId);

        if (!rooms || rooms.length === 0) {
            throw new AppError("No available rooms found for this hotel", HttpStatusCode.NOT_FOUND);
        }

        return rooms.map((room) => new RoomEntity(room));
    }

    protected async getAllRoomsOrThrow(page: number, limit: number, search?: string): Promise<{ rooms: IRoomEntity[], total: number }> {
        const { rooms, total } = await this._roomRepository.findAllRooms(page, limit, search);

        if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
            throw new AppError("No rooms found", HttpStatusCode.NOT_FOUND);
        }

        const roomEntities = rooms.map((r) => new RoomEntity(r));

        return { rooms: roomEntities, total };
    }

    protected async getFilteredAvailableRoomsOrThrow(
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
    ): Promise<{ rooms: IRoomEntity[], total: number }> {
        const { rooms, total } = await this._roomRepository.findFilteredAvailableRooms(
            page,
            limit,
            minPrice,
            maxPrice,
            amenities,
            search,
            destination,
            checkIn,
            checkOut,
            guests
        );

        if (!rooms || rooms.length === 0) {
            throw new AppError("No available rooms found", HttpStatusCode.NOT_FOUND);
        }

        const roomEntities = rooms.map((r) => new RoomEntity(r));
        return { rooms: roomEntities, total };
    }


}
