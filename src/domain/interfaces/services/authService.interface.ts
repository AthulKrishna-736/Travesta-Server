import { TRole } from "../../../shared/types/client.types"
import { TUserRegistrationInput } from "../model/user.interface"

export type TOtpData = TUserRegistrationInput | { email: string } | { [key: string]: any }

export interface IAuthService {
    hashPassword(password: string): Promise<string>
    comparePassword(inputPass: string, hashPass: string): Promise<boolean>
    generateAccessToken(userId: string, role: TRole, email: string): string
    generateRefreshToken(userId: string, role: TRole, email: string): string
    verifyAccessToken(token: string): { userId: string, role: TRole, email: string } | null
    verifyRefreshToken(token: string): { userId: string, role: TRole, email: string } | null
    refreshAccessToken(payload: { userId: string; role: TRole; email: string }): Promise<string>
    generateOtp(length?: number): string
    sendOtpOnEmail(email: string, otp: string): Promise<{ message: string, otpExpireAt: string }>
    storeOtp(userId: string, otp: string, data: TOtpData, purpose: 'signup' | 'reset'): Promise<void>
    verifyOtp(userId: string, otp: string, purpose: 'signup' | 'reset'): Promise<TOtpData>
    resendOtp(userId: string, purpose: 'signup' | 'reset'): Promise<void>
    checkOtpRequestLimit(userId: string, purpose: 'signup' | 'reset'): Promise<void>
}