import { IAuthService } from "../../application/interfaces/authService.interface";
import bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { env } from "../../config/env";
import { AppError } from "../../utils/appError";
import { HttpStatusCode } from "../../utils/HttpStatusCodes";
import { jwtConfig, otpTimer } from "../../config/jwtConfig";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../constants/token";
import { MailService } from "./mailService";
import { RedisService } from "./redisService";

@injectable()
export class AuthService implements IAuthService {
    constructor(
        @inject(TOKENS.MailService) private mailService: MailService,
        @inject(TOKENS.RedisService) private redisService: RedisService
    ) { }

    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10)
        return bcrypt.hash(password, salt)
    }

    async comparePassword(inputPass: string, hashPass: string): Promise<boolean> {
        return bcrypt.compare(inputPass, hashPass)
    }

    generateAccessToken(userId: string, role: string): string {
        const secret: Secret = env.JWT_ACCESS_SECRET;
        const options: SignOptions = {
            expiresIn: `${jwtConfig.accessToken.expiresIn}s`,
        };

        return jwt.sign({ userId, role }, secret, options);
    }

    generateRefreshToken(userId: string, role: string): string {
        const secret: Secret = env.JWT_REFRESH_SECRET;
        const options: SignOptions = {
            expiresIn: `${jwtConfig.refreshToken.expiresIn}d`,
        };

        return jwt.sign({ userId, role }, secret, options);
    }

    verifyAccessToken(token: string): { userId: string, role: string } | null {
        try {
            const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { userId: string, role: string }
            return decoded
        } catch (error: any) {
            throw new AppError("Invalid or expired access token", HttpStatusCode.UNAUTHORIZED);
        }
    }

    verifyRefreshToken(token: string): { userId: string, role: string } | null {
        try {
            const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string, role: string }
            return decoded
        } catch (error: any) {
            throw new AppError("Invalid or expired refresh token", HttpStatusCode.UNAUTHORIZED)
        }
    }

    async refreshAccessToken(token: string): Promise<string> {
        const decoded = this.verifyRefreshToken(token)

        if (!decoded) {
            throw new AppError('Invalid refresh token payload', HttpStatusCode.UNAUTHORIZED)
        }
        const newAccessToken = this.generateAccessToken(decoded.userId, decoded.role);
        return newAccessToken;
    }

    generateOtp(length: number = 6): string {
        if (length <= 0) {
            throw new AppError('Length of otp must be 6', HttpStatusCode.BAD_REQUEST)
        }
        const randomNum = crypto.randomInt(100000, 999999)

        return randomNum.toString()
    }

    async sendOtpOnEmail(email: string, otp: string): Promise<void> {
        await this.mailService.sendOtpEmail(email, otp, (otpTimer.expiresAt / 60).toString());
    }

    async storeOtp(userId: string, otp: string, data: any, purpose: "signup" | "reset"): Promise<void> {
        await this.checkOtpRequestLimit(userId)
        await this.redisService.storeOtp(userId, otp, data, purpose, otpTimer.expiresAt)
    }

    async verifyOtp(userId: string, otp: string, purpose: "signup" | "reset"): Promise<any> {
        const storedData = await this.redisService.getOtp(userId, purpose)

        if (!storedData) {
            throw new AppError('Otp not found or expired', HttpStatusCode.BAD_REQUEST)
        }

        if (storedData.otp != otp) {
            throw new AppError('Invalid otp', HttpStatusCode.BAD_REQUEST)
        }

        await this.redisService.deleteOtp(userId, purpose)
        return storedData.data;
    }

    async resendOtp(userId: string, purpose: "signup" | "reset"): Promise<void> {
        const stored = await this.redisService.getOtp(userId, purpose)

        if (!stored) {
            throw new AppError('Session expired. Please register again.', HttpStatusCode.BAD_REQUEST)
        }

        const otp = this.generateOtp()

        await this.redisService.storeOtp(userId, otp, stored.data, purpose, otpTimer.expiresAt)

        await this.sendOtpOnEmail(stored.data.email, otp);
    }

    async checkOtpRequestLimit(userId: string): Promise<void> {
        const currentCount = await this.redisService.increaseRequestCount(userId, otpTimer.expiresAt)

        if (currentCount > 3) {
            throw new AppError('Too many OTP requests. Please try again after some time.', HttpStatusCode.TOO_MANY_REQUESTS)
        }
    }
}