import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { AppError } from "../../../utils/appError";
import { IAuthService } from "../../../domain/interfaces/services/authService.interface";
import { IRedisService } from "../../../domain/interfaces/services/redisService.interface";
import logger from "../../../utils/logger";
import { jwtConfig } from "../../../infrastructure/config/jwtConfig";
import { AUTH_RES_MESSAGES } from "../../../constants/resMessages";
import { AUTH_ERROR_MESSAGES } from "../../../constants/errorMessages";
import { ILogoutUseCases } from "../../../domain/interfaces/model/auth.interface";


@injectable()
export class LogoutUseCase implements ILogoutUseCases {
    constructor(
        @inject(TOKENS.AuthService) private _authService: IAuthService,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
    ) { }

    async logout(accessToken: string, refreshToken: string): Promise<{ message: string }> {
        let userId: string;
        try {
            const decoded = this._authService.verifyAccessToken(accessToken);
            if (!decoded || !decoded.userId) {
                throw new AppError(AUTH_ERROR_MESSAGES.invalidToken, HttpStatusCode.BAD_REQUEST);
            }
            userId = decoded.userId;
        } catch (error) {
            logger.error(`error in logout: ${error}`);
            const decoded = this._authService.verifyRefreshToken(refreshToken)
            if (!decoded || !decoded.userId) {
                throw new AppError(AUTH_ERROR_MESSAGES.invalidToken, HttpStatusCode.BAD_REQUEST);
            }
            userId = decoded.userId;
        }

        await this._redisService.deleteRefreshToken(userId)

        await this._redisService.blacklistAccessToken(accessToken, jwtConfig.accessToken.maxAge / 1000)

        return { message: AUTH_RES_MESSAGES.logout }
    }
}