export interface IJwtService {
    storeRefreshToken(userId: string, refreshToken: string, expiresIn: number): Promise<void>
    getStoredRefreshToken(userId: string): Promise<string | null>
    deleteRefreshToken(userId: string): Promise<void>
    blacklistAccessToken(token: string, expiresIn: number): Promise<void>
    isAccessTokenBlacklisted(token: string): Promise<boolean>
}