import { inject, injectable } from "tsyringe";
import { IUser, IUserRepository } from "../../../domain/interfaces/user.interface";
import { IAuthService } from "../../interfaces/authService.interface";
import { TOKENS } from "../../../constants/token";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { RedisService } from "../../../infrastructure/services/redisService";
import { jwtConfig } from "../../../infrastructure/config/jwtConfig";
import { ILoginUserUseCase } from "../../../domain/interfaces/usecases.interface";
import { ResponseUserDTO } from "../../../interfaces/dtos/user/user.dto";

@injectable()
export class LoginUser implements ILoginUserUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private readonly userRepository: IUserRepository,
        @inject(TOKENS.AuthService) private readonly authService: IAuthService,
        @inject(TOKENS.RedisService) private readonly redisService: RedisService
    ) { }

    async execute(email: string, password: string, expectedRole: string): Promise<{ accessToken: string, refreshToken: string, user: ResponseUserDTO }> {
        const user = await this.userRepository.findByEmail(email);

        if (!user || !user._id) {
            throw new AppError("User not found", HttpStatusCode.BAD_REQUEST)
        }

        if (user.role !== expectedRole) {
            throw new AppError(`Unauthorized: Invalid role for this login`, HttpStatusCode.UNAUTHORIZED);
        }

        if(user.isBlocked){
            throw new AppError(`${user.role} is blocked`, HttpStatusCode.UNAUTHORIZED);
        }

        const isValidPass = await this.authService.comparePassword(password, user.password)

        if (!isValidPass) {
            throw new AppError("Invalid credentials", HttpStatusCode.BAD_REQUEST)
        }

        const accessToken = this.authService.generateAccessToken(user._id, user.role, user.email);
        const refreshToken = this.authService.generateRefreshToken(user._id, user.role, user.email);

        //mapping user data before response
        const mappedUser: ResponseUserDTO = {
            id: user._id,
            name: `${user.firstName}${user.lastName}`,
            email: user.email,
            phone: user.phone,
            isGoogle: user.isGoogle ?? false,
            isBlocked: user.isBlocked,
            wishlist: user.wishlist,
            role: user.role,
            subscriptionType: user.subscriptionType,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }

        await this.redisService.storeRefreshToken(user._id, refreshToken, jwtConfig.refreshToken.maxAge / 1000)

        return {
            accessToken,
            refreshToken,
            user: mappedUser
        }
    }
}