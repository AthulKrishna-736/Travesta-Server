import { injectable } from "tsyringe";
import { IOtpService } from "../../application/interfaces/otpService.interface";
import Redis from "ioredis";

@injectable()
export class RedisService implements IOtpService {
    private redisClient: Redis

    constructor(){
        this.redisClient = new Redis()
    }

    private getKey(userId: string, purpose: string): string {
        return `otp:${userId}:${purpose}`
    }

    async storeOtp(userId: string, otp: string, purpose: "signup" | "reset", expiresAt: number): Promise<void> {
        const key = this.getKey(userId, purpose);
        await this.redisClient.set(key, otp, 'EX', expiresAt)
    }

    async getOtp(userId: string, purpose: "signup" | "reset"): Promise<string | null> {
        const key = this.getKey(userId, purpose);
        return await this.redisClient.get(key)
    }

    async deleteOtp(userId: string, purpose: "signup" | "reset"): Promise<void> {
        const key = this.getKey(userId, purpose);
        await this.redisClient.del(key)
    }
}