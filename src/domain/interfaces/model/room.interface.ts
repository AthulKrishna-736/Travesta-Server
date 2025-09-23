import { Types } from "mongoose"
import { TCreateRoomDTO, TResponseRoomDTO, TUpdateRoomDTO } from "../../../interfaceAdapters/dtos/room.dto";

export interface IRoom {
    _id?: string;
    hotelId: string | Types.ObjectId;
    name: string;
    roomType: TRoomType;
    roomCount: number;
    bedType: TBedType;
    guest: number;
    amenities: string[];
    images: string[];
    basePrice: number;
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type TRoomType = 'AC' | 'Non-AC' | 'Deluxe' | 'Suite' | 'Standard' | 'Penthouse';
export type TBedType = "King" | "Queen" | "Double" | "Twin" | "Single" | "Sofa" | "Bunk";


// Guest capacity mapping per bed type
export const BED_TYPE_CAPACITY: Record<TBedType, number> = {
    King: 2,
    Queen: 2,
    Double: 2,
    Twin: 1,
    Single: 1,
    Sofa: 1,
    Bunk: 1,
};

//room types
export type TCreateRoomData = Omit<IRoom, '_id' | 'isAvailable' | 'createdAt' | 'updatedAt'>;
export type TUpdateRoomData = Partial<Omit<IRoom, '_id' | 'isAvailable' | 'createdAt' | 'updatedAt'>>;
export type TResponseRoomData = Omit<IRoom, ''>;

//room use cases
export interface ICreateRoomUseCase {
    createRoom(roomData: TCreateRoomDTO, files: Express.Multer.File[]): Promise<{ room: TResponseRoomDTO; message: string }>;
}

export interface IUpdateRoomUseCase {
    updateRoom(roomId: string, updateData: TUpdateRoomDTO, files: Express.Multer.File[]): Promise<{ room: TResponseRoomDTO; message: string }>;
}

export interface IGetRoomByIdUseCase {
    getRoomById(roomId: string): Promise<TResponseRoomDTO>;
}

export interface IGetRoomsByHotelUseCase {
    getRoomsByHotel(hotelId: string): Promise<TResponseRoomDTO[]>;
}

export interface IGetAvailableRoomsUseCase {
    getAvlRooms(page: number, limit: number, minPrice?: number, maxPrice?: number, amenities?: string[], search?: string, destination?: string, checkIn?: string, checkOut?: string, guests?: string): Promise<{ rooms: TResponseRoomDTO[], total: number, message: string }>;
}

export interface IGetAllRoomsUseCase {
    getAllRooms(page: number, limit: number, search?: string): Promise<{ rooms: TResponseRoomDTO[]; message: string; total: number }>;
}
