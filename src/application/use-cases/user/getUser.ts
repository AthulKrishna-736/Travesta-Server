import { inject, injectable } from "tsyringe";
import { IAwsS3Service } from "../../../domain/interfaces/services/awsS3Service.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { TOKENS } from "../../../constants/token";
import { IRedisService } from "../../../domain/interfaces/services/redisService.interface";
import { IUserRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { IGetUserUseCase } from "../../../domain/interfaces/model/usecases.interface";
import { awsS3Timer } from "../../../infrastructure/config/jwtConfig";
import { IUserEntity, UserEntity } from "../../../domain/entities/user/user.entity";

@injectable()
export class GetUserProfileUseCase implements IGetUserUseCase {
    constructor(
        @inject(TOKENS.UserRepository) protected _userRepo: IUserRepository,
        @inject(TOKENS.RedisService) protected _redisService: IRedisService,
        @inject(TOKENS.AwsS3Service) protected _awsS3Service: IAwsS3Service,
    ) { }

    async getUser(userId: string): Promise<{ user: IUserEntity; message: string }> {
        const userData = await this._userRepo.findUserById(userId);

        if (!userData) {
            throw new AppError('User not found', HttpStatusCode.NOT_FOUND);
        }

        const userEntity = new UserEntity(userData);

        let profileImageSignedUrl = await this._redisService.getRedisSignedUrl(userEntity.id as string, 'profile');
        if (!profileImageSignedUrl && userEntity.profileImage) {
            profileImageSignedUrl = await this._awsS3Service.getFileUrlFromAws(userEntity.profileImage, awsS3Timer.expiresAt);
            await this._redisService.storeRedisSignedUrl(userEntity.id as string, profileImageSignedUrl, awsS3Timer.expiresAt);
        }

        userEntity.updateProfile({ profileImage: profileImageSignedUrl ?? undefined });

        return {
            user: userEntity,
            message: 'Profile fetched successfully',
        };
    }
}
