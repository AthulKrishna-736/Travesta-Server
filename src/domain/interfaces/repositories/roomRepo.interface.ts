import { IRoom, TCreateRoomData, TUpdateRoomData } from "../model/room.interface";

export interface IRoomRepository {
    createRoom(data: TCreateRoomData): Promise<IRoom | null>;
    findRoomById(roomId: string): Promise<IRoom | null>;
    updateRoom(roomId: string, data: TUpdateRoomData): Promise<IRoom | null>;
    deleteRoom(roomId: string): Promise<boolean>;
    findDuplicateRooms(roomName: string, hotelId: string): Promise<boolean>;
    getRoomPrice(roomId: string): Promise<{ price: number; roomType: string; hotelId: string }>;
    findRoomsByHotel(hotelId: string): Promise<IRoom[] | null>;
    findOtherRoomsByHotel(hotelId: string, excludeRoomId: string): Promise<IRoom[]>;
    findAvailableRoomsByHotel(hotelId: string): Promise<IRoom[] | null>;
    findAllRooms(vendorId: string, page: number, limit: number, search?: string, hotelId?: string): Promise<{ rooms: IRoom[], total: number }>;
    getRoomPerformance(hotelId: string, period: 'week' | 'month' | 'year'): Promise<any>;
}