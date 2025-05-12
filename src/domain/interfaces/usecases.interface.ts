import { CreateUserDTO, ResponseUserDTO, UpdateUserDTO } from "../../interfaces/dtos/user/user.dto";
import { TRole } from "../../shared/types/client.types";
import { IUser } from "./user.interface";

//user
export interface IRegisterUserUseCase {
    execute(userData: CreateUserDTO): Promise<{ userId: string; message: string }>;
}

export interface IForgotPasswordUseCase {
    execute(email: string, role: TRole): Promise<{ userId: string; message: string }>;
}

export interface ILoginUserUseCase {
    execute(email: string, password: string, expectedRole: string): Promise<{ accessToken: string; refreshToken: string; user: ResponseUserDTO }>;
}

export interface IResendOtpUseCase {
    execute(userId: string, purpose: 'signup' | 'reset'): Promise<{ message: string }>;
}

export interface IUpdatePasswordUseCase {
    execute(email: string, password: string): Promise<void>;
}

export interface IUpdateUserUseCase {
    execute(userId: string, userData: UpdateUserDTO): Promise<IUser>;
}

export interface IVerifyAndRegisterUseCase {
    execute(userData: CreateUserDTO & { createdAt: Date; updatedAt: Date }): Promise<IUser>;
}

export interface IVerifyKycUseCase {
    execute(userId: string): Promise<boolean>;
}

export interface IGoogleLoginUseCase {
    execute(googleToken: string, role: TRole): Promise<{ accessToken: string; refreshToken: string; user: IUser }>;
}

export interface IVerifyOtpUseCase {
    execute(userId: string, otp: string, purpose: 'signup' | 'reset'): Promise<{ isOtpVerified: boolean, data: any }>
}

export interface ILogoutUserUseCase {
    execute(userId: string, accessToken: string): Promise<void>
}

//adminuse cases
export interface IGetAllUsersUseCase {
    execute(page: number, limit: number, role: Exclude<TRole, 'admin'>): Promise<{ users: ResponseUserDTO[]; total: number }>
}

export interface IBlockUnblockUser {
    execute(userId: string): Promise<IUser>
}

export interface IGetAllVendorReqUseCase {
    execute(page: number, limit: number): Promise<{ vendors: ResponseUserDTO[]; total: number }>
}

export interface IUpdateVendorReqUseCase {
    execute(vendorId: string, isVerified: boolean, verificationReason: string): Promise<{ message: string }>
}