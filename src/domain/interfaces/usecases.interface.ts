import { TRole } from "../../shared/types/client.types";
import { IResponseUserData, IUpdateUserData, IUser } from "./user.interface";


//user UserCases
export interface IUpdateUserUseCase {
    execute(userId: string, userData: IUpdateUserData, file?: Express.Multer.File): Promise<{ user: IResponseUserData, message: string }>
}

export interface IGetUserUseCase {
    execute(userId: string): Promise<void>
}

//admin UseCases
export interface IGetAllUsersUseCase {
    execute(page: number, limit: number, role: Exclude<TRole, 'admin'>, search?: string): Promise<{ users: IResponseUserData[]; total: number }>
}

export interface IBlockUnblockUser {
    execute(userId: string): Promise<IUser>
}

export interface IGetAllVendorReqUseCase {
    execute(page: number, limit: number, search?: string): Promise<{ vendors: IResponseUserData[]; total: number }>
}

export interface IUpdateVendorReqUseCase {
    execute(vendorId: string, isVerified: boolean, verificationReason: string): Promise<{ message: string }>
}

//vendor UseCases
export interface IUpdateKycUseCase {
    execute(vendorId: string, frontFile: Express.Multer.File, backFile: Express.Multer.File): Promise<{ vendor: IResponseUserData, message: string }>
}