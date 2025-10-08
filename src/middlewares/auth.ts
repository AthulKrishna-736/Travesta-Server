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

    console.log('req body: ', req.body);
    console.log('req query: ', req.query);
    console.log('req params: ', req.params);
    console.log('req files: ', req.files);
    console.log('req details: ', req.method, '-', req.url);

    const authService = container.resolve<IAuthService>(TOKENS.AuthService);
    const redisService = container.resolve<IJwtService>(TOKENS.RedisService);

    const accessToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;

    if (!accessToken && !refreshToken) {
        return next(new AppError("Authentication tokens are missing", HttpStatusCode.UNAUTHORIZED));
    }

    try {
        if (accessToken) {
            const isBlacklisted = await redisService.isAccessTokenBlacklisted(accessToken);
            if (isBlacklisted) {
                throw new AppError("Access token has been blacklisted", HttpStatusCode.UNAUTHORIZED);
            }

            try {
                const decoded = authService.verifyAccessToken(accessToken);
                req.user = decoded
                logger.info(JSON.stringify(req.user, null, 2))
                return next();
            } catch (accessErr: any) {
                logger.warn("Access token expired or invalid:", accessErr.message);
            }
        }

        if (refreshToken) {
            try {
                authService.verifyRefreshToken(refreshToken);

                if (accessToken) {
                    await redisService.blacklistAccessToken(accessToken, jwtConfig.accessToken.maxAge / 1000);
                }

                const newAccessToken = await authService.refreshAccessToken(refreshToken);
                setAccessCookie(newAccessToken, res)

                return next();
            } catch (refreshErr: any) {
                logger.error("Refresh token expired or invalid:", refreshErr.message);
            }
        }

        throw new AppError("Authentication failed", HttpStatusCode.UNAUTHORIZED);
    } catch (error: any) {
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");
        next(new AppError(error.message || "Unauthorized access", HttpStatusCode.UNAUTHORIZED));
    }
};
