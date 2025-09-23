import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../../../domain/interfaces/repositories/userRepo.interface";
import { TOKENS } from "../../../constants/token";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { AppError } from "../../../utils/appError";
import { IGoogleLoginUseCase } from "../../../domain/interfaces/model/auth.interface";
import { IAuthService } from "../../../domain/interfaces/services/authService.interface";
import { IRedisService } from "../../../domain/interfaces/services/redisService.interface";
import { TRole } from "../../../shared/types/client.types";
import { OAuth2Client } from "google-auth-library";
import { env } from "../../../infrastructure/config/env";
import { jwtConfig } from "../../../infrastructure/config/jwtConfig";
import { UserLookupBase } from "../base/userLookup.base";
import { ResponseMapper } from "../../../utils/responseMapper";
import { ICreateWalletUseCase } from "../../../domain/interfaces/model/wallet.interface";
import { AUTH_ERROR_MESSAGES } from "../../../constants/errorMessages";
import { TCreateUserDTO, TResponseUserDTO } from "../../../interfaceAdapters/dtos/user.dto";


@injectable()
export class GoogleLoginUseCase extends UserLookupBase implements IGoogleLoginUseCase {
    constructor(
        @inject(TOKENS.UserRepository) _userRepository: IUserRepository,
        @inject(TOKENS.AuthService) private _authService: IAuthService,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
        @inject(TOKENS.CreateWalletUseCase) private _createWallet: ICreateWalletUseCase,
    ) {
        super(_userRepository)
    }
    async loginGoogle(googleToken: string, role: TRole): Promise<{ accessToken: string; refreshToken: string; user: TResponseUserDTO; }> {
        const client = new OAuth2Client(env.GOOGLE_ID);

        let payload;

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

        if (user?.role !== role) {
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

        const userEntity = await this.getUserEntityByEmail(user?.email as string)

        if (!user?.isGoogle) {
            userEntity.googleUser();
            if (payload.picture) {
                userEntity.updateProfile({ profileImage: payload.picture });
            }
        }


        await this._userRepository.updateUser(userEntity.id as string, userEntity.getPersistableData())

        if (userEntity.isBlocked) {
            throw new AppError(AUTH_ERROR_MESSAGES.blocked, HttpStatusCode.FORBIDDEN);
        }

        const accessToken = this._authService.generateAccessToken(userEntity.id as string, userEntity.role as TRole, userEntity.email);
        const refreshToken = this._authService.generateRefreshToken(userEntity.id as string, userEntity.role as TRole, userEntity.email);

        await this._redisService.storeRefreshToken(userEntity.id as string, refreshToken, jwtConfig.refreshToken.maxAge / 1000);

        const mapUser = ResponseMapper.mapUserToResponseDTO(userEntity.toObject())

        return {
            accessToken,
            refreshToken,
            user: mapUser
        }
    }
}