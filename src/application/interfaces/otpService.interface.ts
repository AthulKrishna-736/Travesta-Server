import { CreateUserDTO } from "../../interfaces/dtos/user/user.dto"

export interface IOtpService {
    storeOtp(userId: string, otp: string, data: CreateUserDTO & { createdAt: Date, updatedAt: Date },purpose: 'signup' | 'reset', expiresAt: number): Promise<void>
    getOtp(userId: string, purpose: 'signup' | 'reset'): Promise<{ otp: string, data: any } | null>
    deleteOtp(userId: string, purpose: 'signup' | 'reset'): Promise<void>
}