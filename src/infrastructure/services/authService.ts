import { IAuthService, TOtpData } from "../../domain/interfaces/services/authService.interface";
import bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { env } from "../config/env";
import { AppError } from "../../utils/appError";
import { HttpStatusCode } from "../../constants/HttpStatusCodes";
import { jwtConfig, otpTimer } from "../config/jwtConfig";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../constants/token";
import { TRole } from "../../shared/types/client.types";
import { IMailService } from "../../domain/interfaces/services/mailService.interface";
import { IRedisService } from "../../domain/interfaces/services/redisService.interface";

@injectable()
export class AuthService implements IAuthService {
    constructor(
        @inject(TOKENS.MailService) private _mailService: IMailService,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
    ) { }

    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10)
        return bcrypt.hash(password, salt)
    }

    async comparePassword(inputPass: string, hashPass: string): Promise<boolean> {
        return bcrypt.compare(inputPass, hashPass)
    }

    generateAccessToken(userId: string, role: TRole, email: string): string {
        const secret: Secret = env.JWT_ACCESS_SECRET;
        const options: SignOptions = {
            expiresIn: `${jwtConfig.accessToken.expiresIn}d`,
        };

        return jwt.sign({ userId, role, email }, secret, options);
    }

    generateRefreshToken(userId: string, role: TRole, email: string): string {
        const secret: Secret = env.JWT_REFRESH_SECRET;
        const options: SignOptions = {
            expiresIn: `${jwtConfig.refreshToken.expiresIn}d`,
        };

        return jwt.sign({ userId, role, email }, secret, options);
    }

    verifyAccessToken(token: string): { userId: string, role: TRole, email: string } | null {
        try {
            const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { userId: string, role: TRole, email: string }
            return decoded
        } catch (error) {
            throw new AppError(`Invalid or expired access token ${error}`, HttpStatusCode.UNAUTHORIZED);
        }
    }

    verifyRefreshToken(token: string): { userId: string, role: TRole, email: string } | null {
        try {
            const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string, role: TRole, email: string }
            return decoded
        } catch (error) {
            throw new AppError(`Invalid or expired refresh token ${error}`, HttpStatusCode.UNAUTHORIZED)
        }
    }

    async refreshAccessToken(token: string): Promise<string> {
        const decoded = this.verifyRefreshToken(token)

        if (!decoded) {
            throw new AppError('Invalid refresh token payload', HttpStatusCode.UNAUTHORIZED)
        }
        const newAccessToken = this.generateAccessToken(decoded.userId, decoded.role, decoded.email);
        return newAccessToken;
    }

    generateOtp(length: number = 6): string {
        if (length <= 0) {
            throw new AppError('Length of otp must be 6', HttpStatusCode.BAD_REQUEST)
        }
        const randomNum = crypto.randomInt(100000, 999999)

        return randomNum.toString()
    }

    async sendOtpOnEmail(email: string, otp: string): Promise<{ message: string, otpExpireAt: string }> {
        const result = await this._mailService.sendOtpEmail(email, otp, (otpTimer.expiresAt * 1 / 60).toString());
        return result;
    }

    async storeOtp(userId: string, otp: string, data: TOtpData, purpose: "signup" | "reset"): Promise<void> {
        await Promise.all([
            this.checkOtpRequestLimit(userId),
            this._redisService.storeOtp(userId, otp, data, purpose)
        ])
    }

    async verifyOtp(userId: string, otp: string, purpose: "signup" | "reset"): Promise<TOtpData> {
        const storedData = await this._redisService.getOtp(userId, purpose)
        if (!storedData) {
            throw new AppError('Otp not found or expired', HttpStatusCode.BAD_REQUEST)
        }

        const currentTime = new Date().getTime();

        if (currentTime > storedData.expiresAt) {
            throw new AppError('Otp has expired', HttpStatusCode.BAD_REQUEST);
        }

        if (storedData.otp !== otp) {
            throw new AppError('Invalid otp', HttpStatusCode.BAD_REQUEST)
        }

        const deleted = await this._redisService.deleteOtp(userId, purpose)
        if (deleted <= 0) {
            throw new AppError('Error While verifying otp', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        return storedData.data;
    }

    async resendOtp(userId: string, purpose: "signup" | "reset"): Promise<void> {
        const stored = await this._redisService.getOtp(userId, purpose)

        if (!stored) {
            throw new AppError('Session expired. Please try again.', HttpStatusCode.BAD_REQUEST)
        }

        const currentTime = new Date().getTime();

        if (currentTime < stored.expiresAt) {
            throw new AppError('OTP is still valid. Please wait before requesting a new OTP.', HttpStatusCode.BAD_REQUEST);
        }

        const otp = this.generateOtp()

        await Promise.all([
            this._redisService.storeOtp(userId, otp, stored.data, purpose),
            this.sendOtpOnEmail(stored.data.email, otp)
        ])
    }

    async checkOtpRequestLimit(userId: string): Promise<void> {
        const currentCount = await this._redisService.increaseRequestCount(userId, otpTimer.expiresAt)

        if (currentCount > 3) {
            throw new AppError('Too many OTP requests. Please try again after some time.', HttpStatusCode.TOO_MANY_REQUESTS)
        }
    }
}