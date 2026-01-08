import { Types } from "mongoose"
import { TCreateRoomDTO, TResponseRoomDTO, TUpdateRoomDTO } from "../../../interfaceAdapters/dtos/room.dto";

export interface IRoom {
    _id?: string;
    hotelId: string | Types.ObjectId;
    name: string;
    slug: string;
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

export type TRoomType = 'AC' | 'Non-AC' | 'Deluxe' | 'Suite' | 'Standard';
export type TBedType = "King" | "Queen" | "Double" | "Single" | "TwinDouble" | "TwinQueen";


// Guest capacity mapping per bed type
export const BED_TYPE_CAPACITY: Record<TBedType, number> = {
    King: 3,
    Queen: 2,
    Double: 2,
    Single: 1,
    TwinDouble: 4,
    TwinQueen: 4,
};

//room types
export type TCreateRoomData = Omit<IRoom, '_id' | 'isAvailable' | 'createdAt' | 'updatedAt' | 'slug'>;
export type TUpdateRoomData = Partial<Omit<IRoom, '_id' | 'isAvailable' | 'slug' | 'createdAt' | 'updatedAt'>>;
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
    getRoomBySlug(hotelSlug: string, roomSlug: string): Promise<TResponseRoomDTO>;
}

export interface IGetAvailableRoomsUseCase {
    getAvlRooms(page: number, limit: number, minPrice?: number, maxPrice?: number, amenities?: string[], search?: string, destination?: string, checkIn?: string, checkOut?: string, guests?: string): Promise<{ rooms: TResponseRoomDTO[], total: number, message: string }>;
}

export interface IGetAllRoomsUseCase {
    getAllRooms(vendorId: string, page: number, limit: number, search?: string, hotelId?: string): Promise<{ rooms: TResponseRoomDTO[]; message: string; total: number }>;
}
