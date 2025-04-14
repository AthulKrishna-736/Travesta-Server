export interface IAuthService {
    hashPassword(password: string): Promise<string>
    comparePassword(inputPass: string, hashPass: string): Promise<boolean>
    generateAccessToken(userId: string, role: string): string
    generateRefreshToken(userId: string, role: string): string
    verifyAccessToken(token: string): { userId: string, role: string } | null
    verifyRefreshToken(token: string): { userId: string, role: string } | null
    refreshAccessToken(token: string): Promise<string>
    generateOtp(length?: number): string
    sendOtpOnEmail(email: string, otp: string, purpose: 'signup' | 'reset'): Promise<void>
    storeOtp(userId: string, otp: string, purpose: 'signup' | 'reset'): Promise<void>
    verifyOtp(userId: string, otp: string, purpose: 'signup'| 'reset'): Promise<void>
    resetPassword(userId: string, newPassword: string): Promise<void>
}