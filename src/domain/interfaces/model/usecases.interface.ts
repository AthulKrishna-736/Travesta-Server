import { TResponseUserDTO, TUpdateUserDTO } from "../../../interfaceAdapters/dtos/user.dto";
import { TRole } from "../../../shared/types/client.types";

//user UserCases
export interface IUpdateUserUseCase {
    updateUser(userId: string, userData: TUpdateUserDTO, file?: Express.Multer.File): Promise<{ user: TResponseUserDTO, message: string }>
}

export interface IGetUserUseCase {
    getUser(userId: string): Promise<{ user: TResponseUserDTO, message: string }>
}

//admin UseCases
export interface IGetAllUsersUseCase {
    getAllUsers(page: number, limit: number, role: Exclude<TRole, 'admin'>, search?: string, sortField?: string, sortOrder?: string): Promise<{ users: TResponseUserDTO[]; total: number }>
}

export interface IBlockUnblockUser {
    blockUnblockUser(userId: string): Promise<{ user: TResponseUserDTO, message: string }>
}

export interface IGetAllVendorReqUseCase {
    getAllVendorReq(page: number, limit: number, search?: string, sortField?: string, sortOrder?: string): Promise<{ vendors: TResponseUserDTO[]; total: number }>
}

export interface IUpdateVendorReqUseCase {
    updateVendorReq(vendorId: string, isVerified: boolean, verificationReason: string): Promise<{ message: string }>
}

//vendor UseCases
export interface IUpdateKycUseCase {
    updateKyc(vendorId: string, frontFile: Express.Multer.File, backFile: Express.Multer.File): Promise<{ vendor: TResponseUserDTO, message: string }>
}

export interface IGetVendorUseCase {
    getVendor(userId: string): Promise<{ user: TResponseUserDTO, message: string }>
}