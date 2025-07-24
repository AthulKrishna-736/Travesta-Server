import { TRole } from "../../../shared/types/client.types";
import { TCreateBookingData, TResponseBookingData } from "./hotel.interface";
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


//booking
export interface ICreateBookingUseCase {
    execute(data: TCreateBookingData): Promise<{ booking: TResponseBookingData; message: string }>;
}

export interface ICancelBookingUseCase {
    execute(bookingId: string, userId: string): Promise<{ message: string }>;
}

export interface IGetBookingsByUserUseCase {
    getBookingByUser(userId: string, page: number, limit: number): Promise<{ bookings: TResponseBookingData[], total: number }>
}

export interface IGetBookingsByHotelUseCase {
    getBookingsByHotel(hotelId: string, page: number, limit: number): Promise<{ bookings: TResponseBookingData[], total: number }>
}

export interface ICheckRoomAvailabilityUseCase {
    execute(roomId: string, checkIn: Date, checkOut: Date): Promise<boolean>;
}
