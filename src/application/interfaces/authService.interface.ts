import { CreateUserDTO } from "../../interfaces/dtos/user/user.dto"
import { TRole } from "../../shared/types/client.types"

export interface IAuthService {
    hashPassword(password: string): Promise<string>
    comparePassword(inputPass: string, hashPass: string): Promise<boolean>
    generateAccessToken(userId: string, role: TRole, email: string): string
    generateRefreshToken(userId: string, role: TRole, email: string): string
    verifyAccessToken(token: string): { userId: string, role: TRole, email: string } | null
    verifyRefreshToken(token: string): { userId: string, role: TRole, email: string } | null
    refreshAccessToken(token: string): Promise<string>
    generateOtp(length?: number): string
    sendOtpOnEmail(email: string, otp: string): Promise<void>
    storeOtp(userId: string, otp: string, data: CreateUserDTO | { email: string }, purpose: 'signup' | 'reset'): Promise<void>
    verifyOtp(userId: string, otp: string, purpose: 'signup' | 'reset'): Promise<CreateUserDTO | { email: string }>
    resendOtp(userId: string, purpose: 'signup' | 'reset'): Promise<void>
    checkOtpRequestLimit(userId: string, purpose: 'signup' | 'reset'): Promise<void>
}