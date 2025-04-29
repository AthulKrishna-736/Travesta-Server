import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { RedisService } from "../../../infrastructure/services/redisService";
import { jwtConfig } from "../../../infrastructure/config/jwtConfig";


@injectable()
export class LogoutUser {
    constructor(
        @inject(TOKENS.RedisService) private redisService: RedisService
    ) { }

    async execute(userId: string, accessToken: string): Promise<void> {
        await this.redisService.deleteRefreshToken(userId)

        await this.redisService.blacklistAccessToken(accessToken, jwtConfig.accessToken.maxAge / 1000)
    }
}