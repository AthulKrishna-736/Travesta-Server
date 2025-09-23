import { inject, injectable } from "tsyringe";
import { IAwsS3Service } from "../../../domain/interfaces/services/awsS3Service.interface";
import { TOKENS } from "../../../constants/token";
import { IRedisService } from "../../../domain/interfaces/services/redisService.interface";
import { IUserRepository } from "../../../domain/interfaces/repositories/userRepo.interface";
import { IGetUserUseCase } from "../../../domain/interfaces/model/usecases.interface";
import { awsS3Timer } from "../../../infrastructure/config/jwtConfig";
import { IUserEntity } from "../../../domain/entities/user.entity";
import { UserLookupBase } from "../base/userLookup.base";
import { VENDOR_RES_MESSAGES } from "../../../constants/resMessages";
import { TResponseUserDTO } from "../../../interfaceAdapters/dtos/user.dto";
import { ResponseMapper } from "../../../utils/responseMapper";

@injectable()
export class GetUserProfileUseCase extends UserLookupBase implements IGetUserUseCase {
    constructor(
        @inject(TOKENS.UserRepository) _userRepository: IUserRepository,
        @inject(TOKENS.RedisService) protected _redisService: IRedisService,
        @inject(TOKENS.AwsS3Service) protected _awsS3Service: IAwsS3Service,
    ) {
        super(_userRepository)
    }

    protected async _getBaseUserEntityWithProfile(userId: string): Promise<IUserEntity> {
        const userEntity = await this.getUserEntityOrThrow(userId);

        let profileImageSignedUrl = await this._redisService.getRedisSignedUrl(userEntity.id as string, 'profile');
        if (!profileImageSignedUrl && userEntity.profileImage) {
            profileImageSignedUrl = await this._awsS3Service.getFileUrlFromAws(userEntity.id as string, awsS3Timer.expiresAt);
            await this._redisService.storeRedisSignedUrl(userEntity.id as string, profileImageSignedUrl, awsS3Timer.expiresAt);
        }

        userEntity.updateProfile({ profileImage: profileImageSignedUrl as string ?? undefined })
        return userEntity;
    }

    async getUser(userId: string): Promise<{ user: TResponseUserDTO; message: string }> {

        const userEntity = await this._getBaseUserEntityWithProfile(userId);

        const mappedUser = ResponseMapper.mapUserToResponseDTO(userEntity.toObject());

        return {
            user: mappedUser,
            message: VENDOR_RES_MESSAGES.profile,
        };
    }
}
