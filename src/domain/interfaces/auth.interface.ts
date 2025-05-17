import { TRole } from "../../shared/types/client.types"

export interface ICreateUserData {
    email: string
    [key: string]: any
}

export interface IUpdateUserData {
    email: string
    [key: string]: any
}

export interface IResponseUserData {
    email: string
    [key: string]: any
}

export interface IUserData {
    email: string
    firstName: string
    lastName: string
    phone: number
    password: string

}

export interface ILoginUseCase {
    login(email: string, password: string, expectedRole: TRole): Promise<{ accessToken: string, refreshToken: string, user: IResponseUserData }>
}

export interface IRegisterUseCase {
    register(userData: ICreateUserData): Promise<{ userId: string, message: string }>
}

export interface IConfrimRegisterUseCase {
    confirmRegister(userData: ICreateUserData): Promise<IUserData>
}

export interface IGoogleLoginUseCase {
    loginGoogle(googleToken: string, role: TRole): Promise<{ accessToken: string, refreshToken: string, user: IUserData }>
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
    verifyOtp(userId: string, otp: string, purpose: 'signup' | 'reset'): Promise<{ isOtpVerified: boolean, data: any }>
}

export interface ILogoutUseCases {
    logout(accessToken: string, refreshToken: string): Promise<{ message: string }>
}