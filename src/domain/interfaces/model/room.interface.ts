import { Types } from "mongoose"

export interface IRoom {
    _id?: string
    hotelId: string | Types.ObjectId
    name: string
    capacity: number
    bedType: string
    amenities: string[]
    images: string[]
    basePrice: number
    isAvailable: boolean
    createdAt: Date
    updatedAt: Date
}

//room types
export type TCreateRoomData = Omit<IRoom, '_id' | 'isAvailable' | 'createdAt' | 'updatedAt'>;
export type TUpdateRoomData = Partial<Omit<IRoom, '_id' | 'createdAt' | 'updatedAt'>>;
export type TResponseRoomData = Omit<IRoom, ''>;

//room use cases
export interface ICreateRoomUseCase {
    createRoom(roomData: TCreateRoomData, files: Express.Multer.File[]): Promise<{ room: TResponseRoomData; message: string }>;
}

export interface IUpdateRoomUseCase {
    updateRoom(roomId: string, updateData: TUpdateRoomData, files: Express.Multer.File[]): Promise<{ room: TResponseRoomData; message: string }>;
}

export interface IGetRoomByIdUseCase {
    getRoomById(roomId: string): Promise<TResponseRoomData>;
}

export interface IGetRoomsByHotelUseCase {
    getRoomsByHotel(hotelId: string): Promise<TResponseRoomData[]>;
}

export interface IGetAvailableRoomsUseCase {
    getAvlRooms(page: number, limit: number, minPrice?: number, maxPrice?: number, amenities?: string[], search?: string): Promise<{ rooms: TResponseRoomData[], total: number, message: string }>;
}

export interface IGetAllRoomsUseCase {
    getAllRooms(page: number, limit: number, search?: string): Promise<{ rooms: TResponseRoomData[]; message: string; total: number }>;
}
