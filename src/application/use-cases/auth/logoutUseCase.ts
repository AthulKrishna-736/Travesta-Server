import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { AppError } from "../../../utils/appError";
import { IAuthService } from "../../../domain/interfaces/services/authService.interface";
import { IRedisService } from "../../../domain/interfaces/services/redisService.interface";
import logger from "../../../utils/logger";
import { jwtConfig } from "../../../infrastructure/config/jwtConfig";


@injectable()
export class LogoutUseCase {
    constructor(
        @inject(TOKENS.AuthService) private _authService: IAuthService,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
    ) { }

    async logout(accessToken: string, refreshToken: string): Promise<{ message: string }> {
        let userId: string;
        try {
            const decoded = this._authService.verifyAccessToken(accessToken);
            if (!decoded || !decoded.userId) {
                throw new AppError('User id is missing in accessToken', HttpStatusCode.BAD_REQUEST);
            }
            userId = decoded.userId;
        } catch (error) {
            logger.error(`error in logout: ${error}`);
            const decoded = this._authService.verifyRefreshToken(refreshToken)
            if (!decoded || !decoded.userId) {
                throw new AppError('User id is missing in refreshToken', HttpStatusCode.BAD_REQUEST);
            }
            userId = decoded.userId;
        }

        await this._redisService.deleteRefreshToken(userId)

        await this._redisService.blacklistAccessToken(accessToken, jwtConfig.accessToken.maxAge / 1000)

        return { message: 'Logged out successfully' }
    }
}