import { injectable } from "tsyringe";
import { IOtpService } from "../../application/interfaces/otpService.interface";
import { redisClient } from "../../config/redis";

@injectable()
export class RedisService implements IOtpService {
    private redisClient = redisClient

    private getKey(userId: string, purpose: string): string {
        return `otp:${userId}:${purpose}`
    }

    async storeOtp(userId: string, otp: string, data: any, purpose: "signup" | "reset", expiresAt: number): Promise<void> {
        const key = this.getKey(userId, purpose);
        const payload = {
            otp,
            data
        }
        await this.redisClient.set(key, JSON.stringify(payload), {
            EX: expiresAt,
        })
    }

    async getOtp(userId: string, purpose: "signup" | "reset"): Promise<{ otp: string, data: any } | null> {
        const key = this.getKey(userId, purpose);
        const raw = await this.redisClient.get(key)

        if (!raw) return null
        const parsed = JSON.parse(raw);
        return parsed
    }

    async deleteOtp(userId: string, purpose: "signup" | "reset"): Promise<void> {
        const key = this.getKey(userId, purpose);
        await this.redisClient.del(key)
    }

    async increaseRequestCount(key: string, windowSeconds: number): Promise<number> {
        const tx = this.redisClient.multi()
        tx.incr(key)
        tx.expire(key, windowSeconds)
        const [count] = await tx.exec();

        return count as number;
    }
}