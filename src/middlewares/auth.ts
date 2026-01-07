import { Response, NextFunction } from "express";
import { IAuthService } from "../domain/interfaces/services/authService.interface";
import { AppError } from "../utils/appError";
import { HttpStatusCode } from "../constants/HttpStatusCodes";
import { container } from "tsyringe";
import { jwtConfig } from "../infrastructure/config/jwtConfig";
import logger from "../utils/logger";
import { IJwtService } from "../domain/interfaces/services/redisService.interface";
import { TOKENS } from "../constants/token";
import { CustomRequest } from "../utils/customRequest";
import { setAccessCookie } from "../utils/setCookies";

export const authMiddleware = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const authService = container.resolve<IAuthService>(TOKENS.AuthService);
    const redisService = container.resolve<IJwtService>(TOKENS.RedisService);

    const accessToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;

    try {
        if (!accessToken && !refreshToken) {
            throw new AppError("Please sign in to continue.", HttpStatusCode.UNAUTHORIZED);
        }

        // Access token decoding & verification
        if (accessToken) {
            const isBlacklisted = await redisService.isAccessTokenBlacklisted(accessToken);

            if (!isBlacklisted) {
                const decodedToken = authService.verifyAccessToken(accessToken);
                if (decodedToken) {
                    req.user = decodedToken;
                    logger.info("Authenticated via access token", { Id: decodedToken.userId, userId: decodedToken.email, role: decodedToken.role });
                    return next();
                }
            }
        }

        // Refresh token check & verification
        if (!refreshToken) {
            throw new AppError("Your session has expired. Please sign in again.", HttpStatusCode.UNAUTHORIZED);
        }

        const refreshPayload = authService.verifyRefreshToken(refreshToken);
        if (!refreshPayload) {
            logger.warn("Refresh token invalid or expired");
            throw new AppError("Your session has expired. Please sign in again.", HttpStatusCode.UNAUTHORIZED);
        }

        if (accessToken) {
            await redisService.blacklistAccessToken(accessToken, jwtConfig.accessToken.maxAge / 1000);
        }

        // issue new access token
        const newAccessToken = await authService.refreshAccessToken(refreshPayload);
        setAccessCookie(newAccessToken, res);

        // attaching decoded token to request
        const decodedToken = authService.verifyAccessToken(newAccessToken);
        req.user = decodedToken;
        logger.info("Access token refreshed successfully", { Id: req.user?.userId, email: req.user?.email, role: req.user?.role });
        return next();

    } catch (error) {
        logger.error("Authentication failed", { error: error instanceof Error ? error.message : error });
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");
        next(error instanceof AppError ? error : new AppError("Authentication failed. Please sign in again.", HttpStatusCode.UNAUTHORIZED));
    }
};
