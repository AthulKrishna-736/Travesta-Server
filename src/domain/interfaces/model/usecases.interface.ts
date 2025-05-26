import { TRole } from "../../../shared/types/client.types";
import { IHotel, IRoom } from "./hotel.interface";
import { IUser } from "./user.interface";


//user UserCases
export interface IUpdateUserUseCase {
    updateUser(userId: string, userData: IUpdateUserData, file?: Express.Multer.File): Promise<{ user: IUser, message: string }>
}

export interface IGetUserUseCase {
    getUser(userId: string): Promise<{ user: IResponseUserData, message: string }>
}

//admin UseCases
export interface IGetAllUsersUseCase {
    getAllUsers(page: number, limit: number, role: Exclude<TRole, 'admin'>, search?: string): Promise<{ users: IResponseUserData[]; total: number }>
}

export interface IBlockUnblockUser {
    blockUnblockUser(userId: string): Promise<IUser | null>
}

export interface IGetAllVendorReqUseCase {
    getAllVendorReq(page: number, limit: number, search?: string): Promise<{ vendors: IResponseUserData[]; total: number }>
}

export interface IUpdateVendorReqUseCase {
    updateVendorReq(vendorId: string, isVerified: boolean, verificationReason: string): Promise<{ message: string }>
}

//vendor UseCases
export interface IUpdateKycUseCase {
    updateKyc(vendorId: string, frontFile: Express.Multer.File, backFile: Express.Multer.File): Promise<{ vendor: IResponseUserData, message: string }>
}

export interface IGetVendorUseCase {
    getUser(userId: string): Promise<{ user: ResponseUserDTO, message: string }>
}

export interface ICreateHotelUseCase {
    execute(hotelData: CreateHotelDTO, files?: Express.Multer.File[]): Promise<{ hotel: IHotel; message: string }>;
}

export interface IUpdateHotelUseCase {
    execute(hotelId: string, updateData: UpdateHotelDTO, files?: Express.Multer.File[]): Promise<{ hotel: IHotel; message: string }>;
}

export interface IGetHotelByIdUseCase {
    execute(hotelId: string): Promise<{ hotel: ResponseHotelDTO, message: string }>
}

export interface IGetAllHotelsUseCase {
    execute(page: number, limit: number, search?: string): Promise<{ hotels: ResponseHotelDTO[], total: number, message: string }>
}


export interface ICreateRoomUseCase {
    execute(roomData: CreateRoomDTO, files: Express.Multer.File[]): Promise<{ room: any; message: string }>;
}

export interface IUpdateRoomUseCase {
    execute(roomId: string, updateData: UpdateRoomDTO, files: Express.Multer.File[]): Promise<{ room: any; message: string }>;
}

export interface IGetRoomByIdUseCase {
    execute(roomId: string): Promise<IRoom>;
}

export interface IGetRoomsByHotelUseCase {
    execute(hotelId: string): Promise<IRoom[]>;
}

export interface IGetAvailableRoomsByHotelUseCase {
    execute(hotelId: string): Promise<IRoom[]>;
}
