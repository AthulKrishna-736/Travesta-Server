import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { TOKENS } from "../../../constants/token";
import { TResponseUserData } from "../../../domain/interfaces/model/user.interface";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { AppError } from "../../../utils/appError";
import { ILoginUseCase } from "../../../domain/interfaces/model/auth.interface";
import { IAuthService } from "../../../domain/interfaces/services/authService.interface";
import { IRedisService } from "../../../domain/interfaces/services/redisService.interface";
import { IAwsS3Service } from "../../../domain/interfaces/services/awsS3Service.interface";
import { TRole } from "../../../shared/types/client.types";
import { awsS3Timer, jwtConfig } from "../../../infrastructure/config/jwtConfig";
import { UserLookupBase } from "../base/userLookup.base";
import { ResponseMapper } from "../../../utils/responseMapper";


@injectable()
export class LoginUseCase extends UserLookupBase implements ILoginUseCase {
    constructor(
        @inject(TOKENS.UserRepository) userRepo: IUserRepository,
        @inject(TOKENS.AuthService) private _authService: IAuthService,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
    ) {
        super(userRepo)
    }

    async login(email: string, password: string, expectedRole: TRole): Promise<{ accessToken: string; refreshToken: string; user: TResponseUserData }> {
        const userEntity = await this.getUserEntityByEmail(email);

        if (userEntity.role !== expectedRole) {
            throw new AppError(`Unauthorized: Invalid role for this login`, HttpStatusCode.UNAUTHORIZED);
        }

        if (userEntity.isBlocked) {
            throw new AppError(`${userEntity.role} is blocked`, HttpStatusCode.UNAUTHORIZED);
        }

        const isValidPass = await this._authService.comparePassword(password, userEntity.password);
        if (!isValidPass) {
            throw new AppError("Invalid credentials", HttpStatusCode.BAD_REQUEST);
        }

        const accessToken = this._authService.generateAccessToken(userEntity.id!, userEntity.role, userEntity.email);
        const refreshToken = this._authService.generateRefreshToken(userEntity.id!, userEntity.role, userEntity.email);

        let imageUrl = await this._redisService.getRedisSignedUrl(userEntity.id!, 'profile');
        if (!imageUrl && userEntity.profileImage) {
            imageUrl = await this._awsS3Service.getFileUrlFromAws(userEntity.profileImage!, awsS3Timer.expiresAt);
            await this._redisService.storeRedisSignedUrl(userEntity.id!, imageUrl, awsS3Timer.expiresAt);
        }

        let kycDocs: string[] = [];
        const kycDocsFromRedis = await this._redisService.getRedisSignedUrl(userEntity.id!, 'kycDocs');

        if (!kycDocsFromRedis && userEntity.kycDocuments?.length) {
            kycDocs = await Promise.all(userEntity.kycDocuments.map(async (key) => await this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt)));
            await this._redisService.storeKycDocs(userEntity.id!, kycDocs, awsS3Timer.expiresAt)
        }

        userEntity.updateProfile({
            profileImage: imageUrl as string,
            kycDocuments: kycDocs.length > 0 ? kycDocs : kycDocsFromRedis as string[],
        });

        await this._redisService.storeRefreshToken(userEntity.id!, refreshToken, jwtConfig.refreshToken.maxAge / 1000);

        const mapUser = ResponseMapper.mapUserToResponseDTO(userEntity.toObject())

        return {
            accessToken,
            refreshToken,
            user: mapUser
        };
    }

}
