import { TOtpData } from "./authService.interface"

export interface IJwtService {
    storeRefreshToken(userId: string, refreshToken: string, expiresAt: number): Promise<void>
    getStoredRefreshToken(userId: string): Promise<string | null>
    deleteRefreshToken(userId: string): Promise<void>
    blacklistAccessToken(token: string, expiresAt: number): Promise<void>
    isAccessTokenBlacklisted(token: string): Promise<boolean>
}

export interface IOtpService {
    storeOtp(userId: string, otp: string, data: TOtpData, purpose: 'signup' | 'reset'): Promise<void>
    getOtp(userId: string, purpose: 'signup' | 'reset'): Promise<{ otp: string, data: TOtpData, expiresAt: number } | null>
    deleteOtp(userId: string, purpose: 'signup' | 'reset'): Promise<number>
    increaseRequestCount(key: string, windowSeconds: number): Promise<number>
    get<T>(key: string): Promise<T | null>
    set(key: string, value: TOtpData, ttl: number): Promise<void>
    del(key: string): Promise<number>
}



export interface IRedisService extends IJwtService, IOtpService { }