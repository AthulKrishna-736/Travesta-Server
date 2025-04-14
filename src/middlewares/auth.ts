import { Request, Response, NextFunction } from "express";
import { IAuthService } from "../application/interfaces/authService.interface";
import { AppError } from "../utils/appError";
import { HttpStatusCode } from "../utils/HttpStatusCodes";
import { container } from "tsyringe";
import { env } from "../config/env";
import { jwtConfig } from "../config/jwtConfig";
import logger from "../utils/logger";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authService = container.resolve<IAuthService>('AuthService');

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new AppError("Authorization header missing", HttpStatusCode.UNAUTHORIZED));
    }

    const tokenString = authHeader.split(' ')[1];
    const [accessToken, refreshToken] = tokenString.split('::')

    try {
        if (accessToken) {
            try {
                const decoded = authService.verifyAccessToken(accessToken)
                return next()
            } catch (accessErr: any) {
                logger.error('accessToken expired or invalid: ', accessErr.message)
            }
        }

        if (refreshToken) {
            try {
                const decoded = authService.verifyRefreshToken(refreshToken)
                const newAccessToken = await authService.refreshAccessToken(refreshToken);
                res.cookie('access_token', newAccessToken, {
                    httpOnly: true,
                    secure: env.NODE_ENV == 'production',
                    sameSite: 'strict',
                    maxAge: jwtConfig.accessToken.expiresIn
                })
                return next()
            } catch (refreshErr: any) {
                logger.error('refreshToken expired or invalid: ', refreshErr.message);
            }
        }

        throw new AppError('Authenticaiton error', HttpStatusCode.UNAUTHORIZED)
    } catch (error: any) {
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        next(new AppError(error.message || 'Unauthorized access', HttpStatusCode.UNAUTHORIZED))
    }
}