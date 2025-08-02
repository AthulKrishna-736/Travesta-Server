import { TRole } from "../../../shared/types/client.types";
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