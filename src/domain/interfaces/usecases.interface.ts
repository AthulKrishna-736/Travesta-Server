import { CreateUserDTO, UpdateUserDTO } from "../../interfaces/dtos/user/user.dto";
import { TRole } from "../../shared/types/user.types";
import { IUser } from "./user.interface";

//user
export interface IRegisterUserUseCase {
    execute(userData: CreateUserDTO): Promise<{ userId: string; message: string }>;
}

export interface IForgotPasswordUseCase {
    execute(email: string): Promise<{ userId: string; message: string }>;
}

export interface ILoginUserUseCase {
    execute(email: string, password: string, expectedRole: string): Promise<{ accessToken: string; refreshToken: string; user: IUser }>;
}

export interface IResendOtpUseCase {
    execute(userId: string): Promise<{ message: string }>;
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