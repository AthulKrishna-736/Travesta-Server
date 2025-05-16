import { CreateUserDTO, ResponseUserDTO } from "../../interfaces/dtos/user/user.dto"
import { TRole } from "../../shared/types/client.types"
import { IUser } from "./user.interface"


export interface IAuthUseCases {
    login(email: string, password: string, expectedRole: TRole): Promise<{ accessToken: string, refreshToken: string, user: ResponseUserDTO }>
    register(userData: CreateUserDTO): Promise<{ userId: string, message: string }>
    confirmRegister(userData: CreateUserDTO & { createdAt: Date, updatedAt: Date }): Promise<IUser>
    loginGoogle(googleToken: string, role: TRole): Promise<{ accessToken: string, refreshToken: string, user: IUser }>
    forgotPass(email: string, role: TRole): Promise<{ userId: string, message: string }>
    resetPass(email: string, password: string): Promise<void>
    resendOtp(userId: string, purpose: 'signup' | 'reset'): Promise<{ message: string }>
    verifyOtp(userId: string, otp: string, purpose: 'signup' | 'reset'): Promise<{ isOtpVerified: boolean, data: any }>
    logout(accessToken: string, refreshToken: string): Promise<{ message: string }>
}