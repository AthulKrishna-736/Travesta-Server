import { TOtpData } from "./authService.interface"

export interface IJwtService {
    storeRefreshToken(userId: string, refreshToken: string, expiresAt: number): Promise<void>
    getStoredRefreshToken(userId: string): Promise<string | null>
    deleteRefreshToken(userId: string): Promise<void>
    blacklistAccessToken(token: string, expiresAt: number): Promise<void>
    isAccessTokenBlacklisted(token: string): Promise<boolean>
}

export interface IOtpService {
    storeOtp(userId: string, otp: string, data: TOtpData, purpose: 'signup' | 'reset', expiresAt: number): Promise<void>
    getOtp(userId: string, purpose: 'signup' | 'reset'): Promise<{ otp: string, data: TOtpData, expiresAt: number } | null>
    deleteOtp(userId: string, purpose: 'signup' | 'reset'): Promise<void>
    increaseRequestCount(key: string, windowSeconds: number): Promise<number>
    get<T>(key: string): Promise<T | null>
    set(key: string, value: TOtpData, ttl: number): Promise<void>
    del(key: string): Promise<void>
}

export interface IAwsRedisService {
    storeRedisSignedUrl(userId: string, imageUrl: string, expiresAt: number): Promise<void>
    getRedisSignedUrl(userId: string, purpose: 'profile' | 'kycDocs'): Promise<string | string[] | null>
    storeKycDocs(userId: string, imagesUrls: string[], expiresAt: number): Promise<void>
    storeHotelImageUrls(hotelId: string, imageUrls: string[], expiresAt: number): Promise<void>;
    getHotelImageUrls(hotelId: string): Promise<string[] | null>;
    getRoomImageUrls(roomId: string): Promise<string[] | null>;
    storeRoomImageUrls(roomId: string, urls: string[], ttl: number): Promise<void>;
}

export interface IRedisService extends IJwtService, IOtpService, IAwsRedisService { }