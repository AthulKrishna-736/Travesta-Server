import { TCreateUserDTO, TResponseUserDTO } from "../../../interfaceAdapters/dtos/user.dto"
import { TRole } from "../../../shared/types/common.types"
import { TOtpData } from "../services/authService.interface"

export interface ILoginUseCase {
    login(email: string, password: string, expectedRole: TRole): Promise<{ accessToken: string, refreshToken: string, user: TResponseUserDTO }>
}

export interface IRegisterUseCase {
    register(userData: TCreateUserDTO): Promise<{ userId: string, message: string }>
}

export interface IConfrimRegisterUseCase {
    confirmRegister(userData: TCreateUserDTO): Promise<TResponseUserDTO>
}

export interface IGoogleLoginUseCase {
    loginGoogle(googleToken: string, role: TRole): Promise<{ accessToken: string, refreshToken: string, user: TResponseUserDTO }>
}

export interface IForgotPassUseCase {
    forgotPass(email: string, role: TRole): Promise<{ userId: string, message: string }>
}

export interface IChangePasswordUseCase {
    changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{ user: TResponseUserDTO, message: string }>
}

export interface IResetPassUseCase {
    resetPass(email: string, password: string): Promise<void>
}

export interface IResendOtpUseCase {
    resendOtp(userId: string, purpose: 'signup' | 'reset'): Promise<{ message: string }>
}

export interface IVerifyOtpUseCase {
    verifyOtp(userId: string, otp: string, purpose: 'signup' | 'reset'): Promise<{ message: string, data: TOtpData }>
}

export interface ILogoutUseCases {
    logout(accessToken: string, refreshToken: string): Promise<{ message: string }>
}