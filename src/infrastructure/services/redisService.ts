import { injectable } from "tsyringe";
import { IRedisService } from "../../domain/services/redisService.interface";
import { redisClient } from "../config/redis";
import { TOtpData } from "../../domain/services/authService.interface";

@injectable()
export class RedisService implements IRedisService {
    private redisClient = redisClient

    getKey(userId: string, purpose: string): string {
        return `otp:${userId}:${purpose}`
    }

    async get<T>(key: string): Promise<T | null> {
        const raw = await this.redisClient.get(key);
        if (!raw) return null;
        return JSON.parse(raw) as T;
    }

    async set<T>(key: string, value: T, ttl: number): Promise<void> {
        await this.redisClient.set(key, JSON.stringify(value), {
            EX: ttl,
        });
    }

    async del(key: string): Promise<void> {
        await this.redisClient.del(key);
    }

    //otp section
    async storeOtp(userId: string, otp: string, data: TOtpData, purpose: "signup" | "reset", expiresAt: number): Promise<void> {
        const key = this.getKey(userId, purpose);
        const payload = {
            otp,
            data,
            expiryTime: new Date().getTime(),
        }
        await this.set(key, payload, expiresAt)
    }

    async getOtp(userId: string, purpose: "signup" | "reset"): Promise<{ otp: string, data: TOtpData, expiresAt: number } | null> {
        const key = this.getKey(userId, purpose);
        const raw = await this.get(key)

        if (!raw) return null
        const jsonRaws = JSON.stringify(raw)
        const parsed = JSON.parse(jsonRaws);
        return parsed
    }

    async deleteOtp(userId: string, purpose: "signup" | "reset"): Promise<void> {
        const key = this.getKey(userId, purpose);
        await this.del(key)
    }

    async increaseRequestCount(key: string, windowSeconds: number): Promise<number> {
        const tx = this.redisClient.multi()
        tx.incr(key)
        tx.expire(key, windowSeconds)
        const [count] = await tx.exec();

        return count as number;
    }

    //tokens
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

    //aws s3 bucket
    async storeRedisSignedUrl(userId: string, imageUrl: string, expiresAt: number): Promise<void> {
        const key = `profile${userId}`;
        await this.set(key, imageUrl, expiresAt)
    }

    async getRedisSignedUrl(userId: string, purpose: 'profile' | 'kycDocs'): Promise<string | string[] | null> {
        const key = `${purpose}${userId}`;
        const result = await this.get(key);
        if (typeof result == 'string') {
            return result
        }
        return null
    }

    async storeKycDocs(userId: string, imageUrls: string[], expiresAt: number): Promise<void> {
        const key = `kycDocs${userId}`
        await this.set(key, JSON.stringify(imageUrls), expiresAt);
    }

    async storeHotelImageUrls(hotelId: string, imageUrls: string[], expiresAt: number): Promise<void> {
        const key = `hotelImages:${hotelId}`;
        await this.set(key, JSON.stringify(imageUrls), expiresAt);
    }

    async getHotelImageUrls(hotelId: string): Promise<string[] | null> {
        const key = `hotelImages:${hotelId}`;
        const data = await this.get(key);

        if (data && typeof data === 'string') {
            return JSON.parse(data) as string[];
        }
        return null;
    }
}