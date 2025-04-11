import { IAuthService } from "../../application/interfaces/authService.interface";
import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { injectable } from "tsyringe";
import { env } from "../../config/env";
import { AppError } from "../../utils/appError";
import { HttpStatusCode } from "../../utils/HttpStatusCodes";

export class AuthService implements IAuthService {

    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10)
        return bcrypt.hash(password, salt)
    }

    async comparePassword(inputPass: string, hashPass: string): Promise<boolean> {
        return bcrypt.compare(inputPass, hashPass)
    }

    generateAccessToken(userId: string): string {
        const secret: Secret = env.JWT_ACCESS_SECRET;
        const options: SignOptions = {
            expiresIn: '15m',
        };

        return jwt.sign({ userId }, secret, options);
    }

    generateRefreshToken(userId: string): string {
        const secret: Secret = env.JWT_REFRESH_SECRET;
        const options: SignOptions = {
            expiresIn: '7d', 
        };
    
        return jwt.sign({ userId }, secret, options);
    }

    verifyAccessToken(token: string): { userId: string; } | null {
        try {
            const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { userId: string }
            return decoded
        } catch (error: any) {
            throw new AppError("Invalid or expired access token", HttpStatusCode.UNAUTHORIZED);
        }
    }

    verifyRefreshToken(token: string): { userId: string; } | null {
        try {
            const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string }
            return decoded
        } catch (error: any) {
            throw new AppError("Invalid or expired refresh token", HttpStatusCode.UNAUTHORIZED)
        }
    }
}