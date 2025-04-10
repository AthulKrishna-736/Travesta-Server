export interface IAuthService {
    hashPassword(password: string): Promise<string>
    comparePassword(inputPass: string, hashPass: string): Promise<boolean>
    generateToken(userId: string): string
    verifyToken(token: string): { userId: string } | null
}