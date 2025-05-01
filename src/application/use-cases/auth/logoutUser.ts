import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { RedisService } from "../../../infrastructure/services/redisService";
import { jwtConfig } from "../../../infrastructure/config/jwtConfig";
import { ILogoutUserUseCase } from "../../../domain/interfaces/usecases.interface";


@injectable()
export class LogoutUser implements ILogoutUserUseCase{
    constructor(
        @inject(TOKENS.RedisService) private redisService: RedisService
    ) { }

    async execute(userId: string, accessToken: string): Promise<void> {
        await this.redisService.deleteRefreshToken(userId)

        await this.redisService.blacklistAccessToken(accessToken, jwtConfig.accessToken.maxAge / 1000)
    }
}