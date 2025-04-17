export interface IOtpService {
    storeOtp(userId: string, otp: string, purpose: 'signup' | 'reset', expiresAt: number): Promise<void>
    getOtp(userId: string, purpose: 'signup' | 'reset'): Promise<string | null>
    deleteOtp(userId: string, purpose: 'signup' | 'reset'): Promise<void>
}