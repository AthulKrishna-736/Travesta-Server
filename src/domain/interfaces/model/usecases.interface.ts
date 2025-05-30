import { TRole } from "../../../shared/types/client.types";
import { TCreateBookingData, TCreateHotelData, TCreateRoomData, TResponseBookingData, TResponseHotelData, TResponseRoomData, TUpdateHotelData, TUpdateRoomData } from "./hotel.interface";
import { TResponseUserData, TUpdateUserData } from "./user.interface";


//user UserCases
export interface IUpdateUserUseCase {
    updateUser(userId: string, userData: TUpdateUserData, file?: Express.Multer.File): Promise<{ user: TResponseUserData, message: string }>
}

export interface IGetUserUseCase {
    getUser(userId: string): Promise<{ user: TResponseUserData, message: string }>
}

//admin UseCases
export interface IGetAllUsersUseCase {
    getAllUsers(page: number, limit: number, role: Exclude<TRole, 'admin'>, search?: string): Promise<{ users: TResponseUserData[]; total: number }>
}

export interface IBlockUnblockUser {
    blockUnblockUser(userId: string): Promise<TResponseUserData | null>
}

export interface IGetAllVendorReqUseCase {
    getAllVendorReq(page: number, limit: number, search?: string): Promise<{ vendors: TResponseUserData[]; total: number }>
}

export interface IUpdateVendorReqUseCase {
    updateVendorReq(vendorId: string, isVerified: boolean, verificationReason: string): Promise<{ message: string }>
}

//vendor UseCases
export interface IUpdateKycUseCase {
    updateKyc(vendorId: string, frontFile: Express.Multer.File, backFile: Express.Multer.File): Promise<{ vendor: TResponseUserData, message: string }>
}

export interface IGetVendorUseCase {
    getUser(userId: string): Promise<{ user: TResponseUserData, message: string }>
}

//hotels
export interface ICreateHotelUseCase {
    execute(hotelData: TCreateHotelData, files?: Express.Multer.File[]): Promise<{ hotel: TResponseHotelData; message: string }>;
}

export interface IUpdateHotelUseCase {
    execute(hotelId: string, updateData: TUpdateHotelData, files?: Express.Multer.File[]): Promise<{ hotel: TResponseHotelData; message: string }>;
}

export interface IGetHotelByIdUseCase {
    execute(hotelId: string): Promise<{ hotel: TResponseHotelData, message: string }>
}

export interface IGetAllHotelsUseCase {
    execute(page: number, limit: number, search?: string): Promise<{ hotels: TResponseHotelData[], total: number, message: string }>
}

//rooms
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

export interface IGetAvailableRoomsByHotelUseCase {
    getAvlRoomsByHotel(hotelId: string): Promise<TResponseRoomData[]>;
}

export interface IGetAllRoomsUseCase {
    execute(): Promise<{ rooms: TResponseRoomData[]; message: string }>;
}

//booking
export interface ICreateBookingUseCase {
    execute(data: TCreateBookingData): Promise<{ booking: TResponseBookingData; message: string }>;
}

export interface ICancelBookingUseCase {
    execute(bookingId: string, userId: string): Promise<{ message: string }>;
}

export interface IGetBookingsByUserUseCase {
    execute(userId: string): Promise<TResponseBookingData[]>;
}

export interface IGetBookingsByHotelUseCase {
    execute(hotelId: string): Promise<TResponseBookingData[]>;
}

export interface ICheckRoomAvailabilityUseCase {
    execute(roomId: string, checkIn: Date, checkOut: Date): Promise<boolean>;
}
