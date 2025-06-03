import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { IUpdateUserUseCase } from "../../../domain/interfaces/model/usecases.interface";
import { IAwsS3Service } from "../../../domain/interfaces/services/awsS3Service.interface";
import { IUserRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { TResponseUserData, TUpdateUserData } from "../../../domain/interfaces/model/user.interface";
import { awsS3Timer } from "../../../infrastructure/config/jwtConfig";
import { IRedisService } from "../../../domain/interfaces/services/redisService.interface";
import { UserLookupBase } from "../base/userLookup.base";
import { AwsImageUploader } from "../base/imageUploader";

@injectable()
export class UpdateUser extends UserLookupBase implements IUpdateUserUseCase {
    private _imageUpload;
    private _awsS3Service;
    constructor(
        @inject(TOKENS.UserRepository) userRepo: IUserRepository,
        @inject(TOKENS.AwsS3Service) awsS3Service: IAwsS3Service,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
    ) {
        super(userRepo)
        this._imageUpload = new AwsImageUploader(awsS3Service);
        this._awsS3Service = awsS3Service
    }

    async updateUser(userId: string, userData: TUpdateUserData, file?: Express.Multer.File): Promise<{ user: TResponseUserData, message: string }> {

        const userEntity = await this.getUserEntityOrThrow(userId);

        if (file) {
            await this._imageUpload.deleteProfileImage(userData.profileImage as string)
            const uploadedProfile = await this._imageUpload.uploadProfileImage(userId, file)
            userEntity.updateProfile({ profileImage: uploadedProfile })
        }

        userEntity.updateProfile(userData);

        const persistableData = userEntity.getPersistableData();

        const updatedUserData = await this._userRepo.updateUser(userId, persistableData);

        if (!updatedUserData) {
            throw new AppError('Error while updating user', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        if (updatedUserData.profileImage) {
            const signedUrl = await this._awsS3Service.getFileUrlFromAws(updatedUserData.profileImage as string, awsS3Timer.expiresAt);
            await this._redisService.storeRedisSignedUrl(updatedUserData._id as string, signedUrl, awsS3Timer.expiresAt);
        }

        return {
            user: updatedUserData,
            message: 'User updated successfully',
        };
    }
}
