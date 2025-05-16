import { ResponseUserDTO, UpdateUserDTO } from "../../interfaces/dtos/user/user.dto";
import { TRole } from "../../shared/types/client.types";
import { IUser } from "./user.interface";


//user UserCases
export interface IUpdateUserUseCase {
    execute(userId: string, userData: UpdateUserDTO, file?: Express.Multer.File): Promise<{ user: ResponseUserDTO, message: string }>
}

export interface IGetUserUseCase {
    execute(userId: string): Promise<void>
}

//admin UseCases
export interface IGetAllUsersUseCase {
    execute(page: number, limit: number, role: Exclude<TRole, 'admin'>, search?: string): Promise<{ users: ResponseUserDTO[]; total: number }>
}

export interface IBlockUnblockUser {
    execute(userId: string): Promise<IUser>
}

export interface IGetAllVendorReqUseCase {
    execute(page: number, limit: number, search?: string): Promise<{ vendors: ResponseUserDTO[]; total: number }>
}

export interface IUpdateVendorReqUseCase {
    execute(vendorId: string, isVerified: boolean, verificationReason: string): Promise<{ message: string }>
}

//vendor UseCases
export interface IUpdateKycUseCase {
    execute(vendorId: string, frontFile: Express.Multer.File, backFile: Express.Multer.File): Promise<{ vendor: ResponseUserDTO, message: string }>
}