import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../../../domain/interfaces/repositories/userRepo.interface";
import { TOKENS } from "../../../constants/token";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { AppError } from "../../../utils/appError";
import { IGoogleLoginUseCase } from "../../../domain/interfaces/model/auth.interface";
import { IAuthService } from "../../../domain/interfaces/services/authService.interface";
import { IRedisService } from "../../../domain/interfaces/services/redisService.interface";
import { TRole } from "../../../shared/types/client.types";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { env } from "../../../infrastructure/config/env";
import { jwtConfig } from "../../../infrastructure/config/jwtConfig";
import { ResponseMapper } from "../../../utils/responseMapper";
import { ICreateWalletUseCase } from "../../../domain/interfaces/model/wallet.interface";
import { AUTH_ERROR_MESSAGES } from "../../../constants/errorMessages";
import { TCreateUserDTO, TResponseUserDTO } from "../../../interfaceAdapters/dtos/user.dto";


@injectable()
export class GoogleLoginUseCase implements IGoogleLoginUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.AuthService) private _authService: IAuthService,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
        @inject(TOKENS.CreateWalletUseCase) private _createWallet: ICreateWalletUseCase,
    ) { }
    async loginGoogle(googleToken: string, role: TRole): Promise<{ accessToken: string; refreshToken: string; user: TResponseUserDTO; }> {
        const client = new OAuth2Client(env.GOOGLE_ID);

        let payload: TokenPayload | undefined;

        try {
            const ticket = await client.verifyIdToken({
                idToken: googleToken,
                audience: env.GOOGLE_ID,
            });

            payload = ticket.getPayload();
        } catch (error) {
            throw new AppError(AUTH_ERROR_MESSAGES.invalidGoogle, HttpStatusCode.UNAUTHORIZED);
        }

        if (!payload || !payload.email) {
            throw new AppError(AUTH_ERROR_MESSAGES.googleError, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const email = payload.email;

        let user = await this._userRepository.findUser(email);
        if (!user) {
            throw new AppError(AUTH_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        if (user.role !== role) {
            throw new AppError(AUTH_ERROR_MESSAGES.invalidRole, HttpStatusCode.FORBIDDEN)
        }

        if (!user) {
            const newUser: TCreateUserDTO = {
                firstName: payload.given_name || "Google",
                lastName: payload.family_name || "User",
                email: email,
                password: await this._authService.hashPassword(Math.random().toString(36).slice(-8)),
                phone: 0,
                role: role,
            }

            user = await this._userRepository.createUser(newUser)
            await this._createWallet.createUserWallet(user?._id as string);
        }


        const userByEmail = await this._userRepository.findUser(user?.email!)
        if (!userByEmail || !userByEmail._id) {
            throw new AppError(AUTH_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        const updateData: Record<string, any> = { isGoogle: true }
        if (payload.picture) {
            updateData.profileImage = payload.picture;
        }

        const updatedUser = await this._userRepository.updateUser(userByEmail._id, updateData)
        if (!updatedUser || !updatedUser._id) {
            throw new AppError(AUTH_ERROR_MESSAGES.updateFail, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        if (updatedUser.isBlocked) {
            throw new AppError(AUTH_ERROR_MESSAGES.blocked, HttpStatusCode.FORBIDDEN);
        }

        const accessToken = this._authService.generateAccessToken(updatedUser._id, updatedUser.role, updatedUser.email);
        const refreshToken = this._authService.generateRefreshToken(updatedUser._id, updatedUser.role, updatedUser.email);

        await this._redisService.storeRefreshToken(updatedUser._id, refreshToken, jwtConfig.refreshToken.maxAge / 1000);

        const mappedUser = ResponseMapper.mapUserToResponseDTO(updatedUser)

        return {
            accessToken,
            refreshToken,
            user: mappedUser,
        }
    }
}