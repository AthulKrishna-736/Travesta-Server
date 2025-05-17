import { injectable } from "tsyringe";
import { IRedisService } from "../../domain/services/redisService.interface";
import { redisClient } from "../config/redis";
import { CreateUserDTO } from "../../interfaces/dtos/user/user.dto";

@injectable()
export class RedisService implements IRedisService {
    private redisClient = redisClient

    private getKey(userId: string, purpose: string): string {
        return `otp:${userId}:${purpose}`
    }

    async get(key: string): Promise<any | null> {
        const raw = await this.redisClient.get(key);
        if (!raw) return null;
        return JSON.parse(raw);
    }

    async set(key: string, value: CreateUserDTO | { email: string }, ttl: number): Promise<void> {
        await this.redisClient.set(key, JSON.stringify(value), {
            EX: ttl,
        });
    }

    async del(key: string): Promise<void> {
        await this.redisClient.del(key);
    }

    async storeOtp(userId: string, otp: string, data: CreateUserDTO | { email: string }, purpose: "signup" | "reset", expiresAt: number): Promise<void> {
        const key = this.getKey(userId, purpose);
        const payload = {
            otp,
            data,
            expiryTime: new Date().getTime(),
        }
        await this.redisClient.set(key, JSON.stringify(payload), {
            EX: expiresAt,
        })
    }

    async getOtp(userId: string, purpose: "signup" | "reset"): Promise<{ otp: string, data: CreateUserDTO | { email: string }, expiryTime: number } | null> {
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

    async storeRefreshToken(userId: string, refreshToken: string, expiresIn: number): Promise<void> {
        const key = `refresh:${userId}`
        await this.redisClient.set(key, refreshToken, { EX: expiresIn });
    }

    async getStoredRefreshToken(userId: string): Promise<string | null> {
        const key = `refresh:${userId}`
        return await this.redisClient.get(key)
    }

    async deleteRefreshToken(userId: string): Promise<void> {
        const key = `refresh:${userId}`
        await this.redisClient.del(key)
    }

    async blacklistAccessToken(token: string, expiresIn: number): Promise<void> {
        const key = `blacklist:${token}`
        await this.redisClient.set(key, 'blacklisted', { EX: expiresIn })
    }

    async isAccessTokenBlacklisted(token: string): Promise<boolean> {
        const key = `blacklist:${token}`
        const result = await this.redisClient.get(key)

        return result === 'blacklisted';
    }
}