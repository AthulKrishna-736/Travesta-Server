import { IAuthService } from "../../application/interfaces/authService.interface";
import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { env } from "../../config/env";
import { AppError } from "../../utils/appError";
import { HttpStatusCode } from "../../utils/HttpStatusCodes";
import { jwtConfig } from "../../config/jwtConfig";

export class AuthService implements IAuthService {

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
            expiresIn: `${jwtConfig.refreshToken.expiresIn}s`,
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
}