import { inject, injectable } from "tsyringe";
import { IUser, IUserRepository } from "../../../domain/interfaces/user.interface";
import { IAuthService } from "../../interfaces/authService.interface";
import { TOKENS } from "../../../constants/token";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { RedisService } from "../../../infrastructure/services/redisService";
import { jwtConfig } from "../../../config/jwtConfig";

@injectable()
export class LoginUser {
    constructor(
        @inject(TOKENS.UserRepository) private readonly userRepository: IUserRepository,
        @inject(TOKENS.AuthService) private readonly authService: IAuthService,
        @inject(TOKENS.RedisService) private readonly redisService: RedisService
    ) { }

    async execute(email: string, password: string): Promise<{ accessToken: string, refreshToken: string, user: IUser }> {
        const user = await this.userRepository.findByEmail(email);

        if (!user || !user._id) {
            throw new AppError("User not found", HttpStatusCode.BAD_REQUEST)
        }

        const isValidPass = await this.authService.comparePassword(password, user.password)

        if (!isValidPass) {
            throw new AppError("Invalid password", HttpStatusCode.BAD_REQUEST)
        }

        const accessToken = this.authService.generateAccessToken(user._id, user.role);
        const refreshToken = this.authService.generateRefreshToken(user._id, user.role);

        await this.redisService.storeRefreshToken(user._id, refreshToken, jwtConfig.refreshToken.maxAge / 1000)

        return {
            accessToken,
            refreshToken,
            user
        }
    }
}