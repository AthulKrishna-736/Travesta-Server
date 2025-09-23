import { IRoom, TCreateRoomData, TUpdateRoomData } from "../model/room.interface";

export interface IRoomRepository {
    createRoom(data: TCreateRoomData): Promise<IRoom | null>;
    findRoomById(roomId: string): Promise<IRoom | null>;
    updateRoom(roomId: string, data: TUpdateRoomData): Promise<IRoom | null>;
    deleteRoom(roomId: string): Promise<boolean>;
    findDuplicateRooms(roomName: string): Promise<boolean>;
    findRoomsByHotel(hotelId: string): Promise<IRoom[] | null>;
    findAvailableRoomsByHotel(hotelId: string): Promise<IRoom[] | null>;
    findAllRooms(page: number, limit: number, search?: string): Promise<{ rooms: IRoom[], total: number }>;
    findFilteredAvailableRooms(
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
    ): Promise<{ rooms: IRoom[]; total: number }>;
}