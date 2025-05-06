import { TRole } from "../../shared/types/client.types"

export interface IAuthService {
    hashPassword(password: string): Promise<string>
    comparePassword(inputPass: string, hashPass: string): Promise<boolean>
    generateAccessToken(userId: string, role: TRole): string
    generateRefreshToken(userId: string, role: TRole): string
    verifyAccessToken(token: string): { userId: string, role: TRole } | null
    verifyRefreshToken(token: string): { userId: string, role: TRole } | null
    refreshAccessToken(token: string): Promise<string>
    generateOtp(length?: number): string
    sendOtpOnEmail(email: string, otp: string): Promise<void>
    storeOtp(userId: string, otp: string, data: any, purpose: 'signup' | 'reset'): Promise<void>
    verifyOtp(userId: string, otp: string, purpose: 'signup' | 'reset'): Promise<any>
    resendOtp(userId: string, purpose: 'signup' | 'reset'): Promise<void>
    checkOtpRequestLimit(userId: string, purpose: 'signup' | 'reset'): Promise<void>
}