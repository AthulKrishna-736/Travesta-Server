import { inject, injectable } from "tsyringe";
import { IUser, IUserRepository } from "../../domain/interfaces/user.interface";
import { IAuthService } from "../interfaces/authService.interface";
import { TOKENS } from "../../constants/token";
import { AppError } from "../../utils/appError";
import { HttpStatusCode } from "../../utils/HttpStatusCodes";
import { jwtConfig } from "../../infrastructure/config/jwtConfig";
import { RedisService } from "../../infrastructure/services/redisService";
import { env } from '../../infrastructure/config/env'
import { OAuth2Client } from 'google-auth-library';
import { CreateUserDTO } from "../../interfaces/dtos/user/user.dto";
import { TRole } from "../../shared/types/user.types";
import { IGoogleLoginUseCase } from "../../domain/interfaces/usecases.interface";

@injectable()
export class GoogleLogin implements IGoogleLoginUseCase{
    constructor(
        @inject(TOKENS.UserRepository) private readonly userRepository: IUserRepository,
        @inject(TOKENS.AuthService) private readonly authService: IAuthService,
        @inject(TOKENS.RedisService) private readonly redisService: RedisService
    ) { }

    async execute(googleToken: string, role: TRole): Promise<{ accessToken: string, refreshToken: string, user: IUser }> {
        const client = new OAuth2Client(env.GOOGLE_ID);

        let payload;

        try {
            const ticket = await client.verifyIdToken({
                idToken: googleToken,
                audience: env.GOOGLE_ID,
            });

            payload = ticket.getPayload();
        } catch (error: any) {
            throw new AppError('Invalid Google Token', HttpStatusCode.UNAUTHORIZED);
        }

        if (!payload || !payload.email) {
            throw new AppError("Unable to retrieve user information from Google", HttpStatusCode.BAD_REQUEST);
        }

        const email = payload.email;

        let user = await this.userRepository.findByEmail(email);

        if (!user) {
            const newUser: CreateUserDTO = {
                firstName: payload.given_name || "Google",
                lastName: payload.family_name || "User",
                email: email,
                password: await this.authService.hashPassword(Math.random().toString(36).slice(-8)),
                phone: 0,
                role: role,
                subscriptionType: "basic",
            }

            user = await this.userRepository.createUser(newUser)
        }

        if (!user || !user._id) {
            throw new AppError('User not found', HttpStatusCode.BAD_REQUEST)
        }
        await this.userRepository.updateUser(user._id, { isGoogle: true, profileImage: payload.picture })


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