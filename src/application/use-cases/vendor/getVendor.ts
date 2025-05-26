import { inject, injectable } from "tsyringe";
import { GetUserProfileUseCase } from "../user/getUser";
import { IUserRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { IRedisService } from "../../../domain/interfaces/services/redisService.interface";
import { IAwsS3Service } from "../../../domain/interfaces/services/awsS3Service.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { awsS3Timer } from "../../../infrastructure/config/jwtConfig";
import { IGetVendorUseCase } from "../../../domain/interfaces/model/usecases.interface";
import { TOKENS } from "../../../constants/token";
import { UserEntity } from "../../../domain/entities/user.entity";

@injectable()
export class GetVendorProfileUseCase extends GetUserProfileUseCase implements IGetVendorUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private _userRepo: IUserRepository,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
    ) {
        super(_userRepo, _redisService, _awsS3Service);
    }

    async getUser(userId: string): Promise<{ user: UserEntity; message: string }> {
        const vendorData = await this._userRepo.findUserById(userId);

        if (!vendorData) {
            throw new AppError('User not found', HttpStatusCode.NOT_FOUND);
        }

        const vendorEntity = new UserEntity(vendorData);

        // Get profile image signed URL from cache or AWS
        let profileImageSignedUrl = await this._redisService.getRedisSignedUrl(vendorEntity.id as string, 'profile');
        if (!profileImageSignedUrl && vendorEntity.profileImage) {
            profileImageSignedUrl = await this._awsS3Service.getFileUrlFromAws(vendorEntity.profileImage, awsS3Timer.expiresAt);
            await this._redisService.storeRedisSignedUrl(vendorEntity.id as string, profileImageSignedUrl, awsS3Timer.expiresAt);
        }

        // Get KYC docs signed URLs from cache or AWS
        let kycDocumentsSignedUrls: string[] | undefined;
        kycDocumentsSignedUrls = await this._redisService.getRedisSignedUrl(vendorEntity.id as string, 'kycDocs');
        if ((!kycDocumentsSignedUrls || kycDocumentsSignedUrls.length === 0) && vendorEntity.kycDocuments?.length) {
            kycDocumentsSignedUrls = await Promise.all(
                vendorEntity.kycDocuments.map(key => this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt))
            );
            // Optionally cache these URLs
        }

        // Override the profileImage and kycDocuments in the domain entity's private data
        // Here we directly mutate the _user object in entity for convenience (or you can extend entity with setters)
        vendorEntity.updateProfile({
            profileImage: profileImageSignedUrl ?? undefined,
            kycDocuments: kycDocumentsSignedUrls,
        });

        return {
            user: vendorEntity,
            message: 'Profile fetched successfully',
        };
    }

}
