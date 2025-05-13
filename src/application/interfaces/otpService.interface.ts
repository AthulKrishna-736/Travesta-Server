
export interface IOtpService {
    storeOtp(userId: string, otp: string, data: any, purpose: 'signup' | 'reset', expiresAt: number): Promise<void>
    getOtp(userId: string, purpose: 'signup' | 'reset'): Promise<{ otp: string, data: any, expiryTime: number } | null>
    deleteOtp(userId: string, purpose: 'signup' | 'reset'): Promise<void>
    increaseRequestCount(key: string, windowSeconds: number): Promise<number>
    get(key: string): Promise<any | null>
    set(key: string, value: any, ttl: number): Promise<void>
    del(key: string): Promise<void>
}