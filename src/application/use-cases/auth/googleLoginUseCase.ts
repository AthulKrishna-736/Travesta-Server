import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { TOKENS } from "../../../constants/token";
import { TResponseUserData, TUserRegistrationInput } from "../../../domain/interfaces/model/user.interface";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
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


@injectable()
export class GoogleLoginUseCase extends UserLookupBase implements IGoogleLoginUseCase {
    constructor(
        @inject(TOKENS.UserRepository) userRepo: IUserRepository,
        @inject(TOKENS.AuthService) private _authService: IAuthService,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
        @inject(TOKENS.CreateWalletUseCase) private _createWallet: ICreateWalletUseCase,
    ) {
        super(userRepo)
    }
    async loginGoogle(googleToken: string, role: TRole): Promise<{ accessToken: string; refreshToken: string; user: TResponseUserData; }> {
        const client = new OAuth2Client(env.GOOGLE_ID);

        let payload;

        try {
            const ticket = await client.verifyIdToken({
                idToken: googleToken,
                audience: env.GOOGLE_ID,
            });

            payload = ticket.getPayload();
        } catch (error) {
            throw new AppError('Invalid Google Token', HttpStatusCode.UNAUTHORIZED);
        }

        if (!payload || !payload.email) {
            throw new AppError("Unable to retrieve user information from Google", HttpStatusCode.BAD_REQUEST);
        }

        const email = payload.email;

        let user = await this._userRepo.findUser(email);

        if (user?.role !== role) {
            throw new AppError("Sorry, the user does not have the required role to proceed.", HttpStatusCode.FORBIDDEN)
        }

        if (!user) {
            const newUser: TUserRegistrationInput = {
                firstName: payload.given_name || "Google",
                lastName: payload.family_name || "User",
                email: email,
                password: await this._authService.hashPassword(Math.random().toString(36).slice(-8)),
                phone: 0,
                role: role,
            }

            user = await this._userRepo.createUser(newUser)
            await this._createWallet.createUserWallet(user?._id as string);
        }

        const userEntity = await this.getUserEntityByEmail(user?.email as string)

        if (!user?.isGoogle) {
            userEntity.googleUser();
            if (payload.picture) {
                userEntity.updateProfile({ profileImage: payload.picture });
            }
        }


        await this._userRepo.updateUser(userEntity.id as string, userEntity.getPersistableData())

        if (userEntity.isBlocked) {
            throw new AppError('User is blocked', HttpStatusCode.UNAUTHORIZED);
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