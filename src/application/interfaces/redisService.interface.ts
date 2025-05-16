import { CreateUserDTO } from "../../interfaces/dtos/user/user.dto"

export interface IJwtService {
    storeRefreshToken(userId: string, refreshToken: string, expiresIn: number): Promise<void>
    getStoredRefreshToken(userId: string): Promise<string | null>
    deleteRefreshToken(userId: string): Promise<void>
    blacklistAccessToken(token: string, expiresIn: number): Promise<void>
    isAccessTokenBlacklisted(token: string): Promise<boolean>
}

export interface IOtpService {
    storeOtp(userId: string, otp: string, data: CreateUserDTO | { email: string }, purpose: 'signup' | 'reset', expiresAt: number): Promise<void>
    getOtp(userId: string, purpose: 'signup' | 'reset'): Promise<{ otp: string, data: CreateUserDTO | { email: string }, expiryTime: number } | null>
    deleteOtp(userId: string, purpose: 'signup' | 'reset'): Promise<void>
    increaseRequestCount(key: string, windowSeconds: number): Promise<number>
    get(key: string): Promise<any | null>
    set(key: string, value: CreateUserDTO | { email: string }, ttl: number): Promise<void>
    del(key: string): Promise<void>
}