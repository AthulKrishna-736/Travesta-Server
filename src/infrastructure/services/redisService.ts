import { injectable } from "tsyringe";
import { IRedisService } from "../../domain/interfaces/services/redisService.interface";
import { redisClient } from "../config/redis";
import { TOtpData } from "../../domain/interfaces/services/authService.interface";
import { otpTimer } from "../config/jwtConfig";

@injectable()
export class RedisService implements IRedisService {
    private redisClient = redisClient

    //redis operations
    async get<T>(key: string): Promise<T | null> {
        const raw = await this.redisClient.get(key);
        if (!raw) return null;
        return JSON.parse(raw) as T;
    }

    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        if (ttl) {
            await this.redisClient.set(key, JSON.stringify(value), { EX: ttl })
        } else {
            await this.redisClient.set(key, JSON.stringify(value));
        }
    }

    async del(key: string): Promise<number> {
        const result = await this.redisClient.del(key);
        return result;
    }

    //otp section
    async storeOtp(userId: string, otp: string, data: TOtpData): Promise<void> {
        const payload = {
            otp,
            data,
            expiresAt: new Date(Date.now() + 1 * 60 * 1000).getTime(),
        }
        await this.set(userId, payload, otpTimer.expiresAt * 3);
    }

    async getOtp(userId: string): Promise<{ otp: string, data: TOtpData, expiresAt: number } | null> {
        const raw = await this.get(userId)

        if (!raw) return null
        const jsonRaws = JSON.stringify(raw)
        const parsed = JSON.parse(jsonRaws);
        return parsed
    }

    async deleteOtp(userId: string): Promise<number> {
        const result = await this.del(userId);
        return result;
    }

    async increaseRequestCount(key: string, windowSeconds: number): Promise<number> {
        const tx = this.redisClient.multi()
        tx.incr(key)
        tx.expire(key, windowSeconds)
        const [count] = await tx.exec();

        return count as unknown as number;
    }

    //tokens section
    async storeRefreshToken(userId: string, refreshToken: string, expiresAt: number): Promise<void> {
        const key = `refresh:${userId}`
        await this.set(key, refreshToken, expiresAt);
    }

    async getStoredRefreshToken(userId: string): Promise<string | null> {
        const key = `refresh:${userId}`
        return await this.get(key)
    }

    async deleteRefreshToken(userId: string): Promise<void> {
        const key = `refresh:${userId}`
        await this.del(key)
    }

    async blacklistAccessToken(token: string, expiresAt: number): Promise<void> {
        const key = `blacklist:${token}`
        await this.set(key, 'blacklisted', expiresAt)
    }

    async isAccessTokenBlacklisted(token: string): Promise<boolean> {
        const key = `blacklist:${token}`
        const result = await this.get(key)

        return result === 'blacklisted';
    }
}