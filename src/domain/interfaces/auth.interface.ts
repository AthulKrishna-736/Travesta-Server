import { TRole } from "../../shared/types/client.types"
import { TOtpData } from "../services/authService.interface"
import { ICreateUserData, IResponseUserData, IUser } from "./user.interface"


export interface ILoginUseCase {
    login(email: string, password: string, expectedRole: TRole): Promise<{ accessToken: string, refreshToken: string, user: IResponseUserData }>
}

export interface IRegisterUseCase {
    register(userData: ICreateUserData): Promise<{ userId: string, message: string }>
}

export interface IConfrimRegisterUseCase {
    confirmRegister(userData: ICreateUserData): Promise<IUser>
}

export interface IGoogleLoginUseCase {
    loginGoogle(googleToken: string, role: TRole): Promise<{ accessToken: string, refreshToken: string, user: IUser }>
}

export interface IForgotPassUseCase {
    forgotPass(email: string, role: TRole): Promise<{ userId: string, message: string }>
}

export interface IResetPassUseCase {
    resetPass(email: string, password: string): Promise<void>
}

export interface IResendOtpUseCase {
    resendOtp(userId: string, purpose: 'signup' | 'reset'): Promise<{ message: string }>
}

export interface IVerifyOtpUseCase {
    verifyOtp(userId: string, otp: string, purpose: 'signup' | 'reset'): Promise<{ isOtpVerified: boolean, data: TOtpData }>
}

export interface ILogoutUseCases {
    logout(accessToken: string, refreshToken: string): Promise<{ message: string }>
}