import { IAuthService } from "../../application/interfaces/authService.interface";
import bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { env } from "../../config/env";
import { AppError } from "../../utils/appError";
import { HttpStatusCode } from "../../utils/HttpStatusCodes";
import { jwtConfig } from "../../config/jwtConfig";
import { inject } from "tsyringe";
import { TOKENS } from "../../constants/token";
import { MailService } from "./mailService";

export class AuthService implements IAuthService {
    private otpStore: Map<string, { otp: string; purpose: 'signup' | 'reset'; expiresAt: Date }> = new Map()

    constructor(
        @inject(TOKENS.MailService) private mailService: MailService
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

        const max = Math.pow(10, length) - 1;
        const randomNum = crypto.randomInt(0, max + 1)

        return randomNum.toString().padStart(length, '0')
    }

    async sendOtpOnEmail(email: string, otp: string, purpose: "signup" | "reset"): Promise<void> {
        const otpExpireAt = new Date(Date.now() + 2 * 60 * 1000); // 2 min expiry

        await this.mailService.sendOtpEmail(email, otp, otpExpireAt);
    }

    async storeOtp(userId: string, otp: string, purpose: "signup" | "reset"): Promise<void> {
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
        this.otpStore.set(`${userId}:${purpose}`, { otp, purpose, expiresAt})
    }

    async verifyOtp(userId: string, otp: string, purpose: "signup" | "reset"): Promise<void> {
        const key = `${userId}:${purpose}`;
        const stored = this.otpStore.get(key)

        if(!stored){
            throw new AppError('OTP not found or expired', HttpStatusCode.BAD_REQUEST);
        }

        if(stored.expiresAt < new Date()){
            this.otpStore.delete(key);
            throw new AppError('OTP has expired', HttpStatusCode.BAD_REQUEST);
        }

        if(stored.otp !== otp){
            throw new AppError('Invalid OTP', HttpStatusCode.BAD_REQUEST)
        }

        this.otpStore.delete(key)
    }

    async resetPassword(userId: string, newPassword: string): Promise<void> {
        
    }
}