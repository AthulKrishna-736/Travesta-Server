export interface IAuthService {
    hashPassword(password: string): Promise<string>
    comparePassword(inputPass: string, hashPass: string): Promise<boolean>
    generateAccessToken(userId: string): string
    generateRefreshToken(userId: string): string
    verifyAccessToken(token: string): { userId: string } | null
    verifyRefreshToken(token: string): { userId: string } | null
}